using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using TaskFlow.API.Interfaces;

namespace TaskFlow.API.Hubs;

/// <summary>
/// TaskFlow SignalR Hub - Real-time iletişim merkezi
/// Kullanıcılar arası live updates, notifications ve task changes için
/// </summary>
[Authorize] // JWT authentication gerekli
public class TaskFlowHub : Hub
{
    private readonly ILogger<TaskFlowHub> _logger;
    private readonly ICacheService _cacheService;
    private readonly IUserService _userService;

    // Online kullanıcıları takip etmek için
    private static readonly Dictionary<string, UserConnectionInfo> OnlineUsers = new();
    private static readonly object OnlineUsersLock = new();

    /// <summary>
    /// Hub constructor - Dependency injection
    /// </summary>
    public TaskFlowHub(
        ILogger<TaskFlowHub> logger,
        ICacheService cacheService,
        IUserService userService)
    {
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
        _userService = userService ?? throw new ArgumentNullException(nameof(userService));
    }

    #region Connection Management

    /// <summary>
    /// Kullanıcı bağlandığında çalışır
    /// User'ı online listesine ekler ve gerekli gruplara join eder
    /// </summary>
    public override async Task OnConnectedAsync()
    {
        try
        {
            var userId = GetUserId();
            var userName = GetUserName();
            
            if (userId == null || userName == null)
            {
                _logger.LogWarning("Unauthorized SignalR connection attempt");
                Context.Abort();
                return;
            }

            // Connection bilgilerini kaydet
            var connectionInfo = new UserConnectionInfo
            {
                UserId = userId.Value,
                UserName = userName,
                ConnectionId = Context.ConnectionId,
                ConnectedAt = DateTime.UtcNow
            };

            lock (OnlineUsersLock)
            {
                OnlineUsers[Context.ConnectionId] = connectionInfo;
            }

            // User'ı kendi personal grubuna ekle (private notifications için)
            await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");

            // Online users listesini güncelle ve broadcast et
            var onlineUsersList = GetOnlineUsersList();
            await Clients.All.SendAsync("OnlineUsersUpdated", onlineUsersList);

            // Kullanıcının pending notifications'larını gönder
            await SendPendingNotificationsAsync(userId.Value);

            _logger.LogInformation("User connected to SignalR: {UserId} ({UserName})", userId, userName);
            
            await base.OnConnectedAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in OnConnectedAsync");
            Context.Abort();
        }
    }

    /// <summary>
    /// Kullanıcı bağlantıyı kestiğinde çalışır
    /// User'ı online listesinden çıkarır
    /// </summary>
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        try
        {
            UserConnectionInfo? connectionInfo = null;
            
            lock (OnlineUsersLock)
            {
                if (OnlineUsers.TryGetValue(Context.ConnectionId, out connectionInfo))
                {
                    OnlineUsers.Remove(Context.ConnectionId);
                }
            }

            if (connectionInfo != null)
            {
                // Online users listesini güncelle ve broadcast et
                var onlineUsersList = GetOnlineUsersList();
                await Clients.All.SendAsync("OnlineUsersUpdated", onlineUsersList);

                var duration = DateTime.UtcNow - connectionInfo.ConnectedAt;
                _logger.LogInformation("User disconnected from SignalR: {UserId} ({UserName}), Duration: {Duration}",
                    connectionInfo.UserId, connectionInfo.UserName, duration);
            }

            await base.OnDisconnectedAsync(exception);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in OnDisconnectedAsync");
        }
    }

    #endregion

    #region Task Updates

    /// <summary>
    /// Task oluşturulduğunda real-time broadcast
    /// </summary>
    [HubMethodName("TaskCreated")]
    public async Task OnTaskCreated(int taskId, string taskTitle, int categoryId)
    {
        try
        {
            var userId = GetUserId();
            if (userId == null) return;

            var notification = new
            {
                Type = "TaskCreated",
                TaskId = taskId,
                TaskTitle = taskTitle,
                CategoryId = categoryId,
                UserId = userId,
                Timestamp = DateTime.UtcNow,
                Message = $"Yeni görev oluşturuldu: {taskTitle}"
            };

            // Sadece o kullanıcıya gönder (kendi task'ı)
            await Clients.Group($"User_{userId}").SendAsync("TaskUpdate", notification);

            _logger.LogDebug("Task created notification sent: {TaskId} for user {UserId}", taskId, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting task creation");
        }
    }

    /// <summary>
    /// Task güncellendiğinde real-time broadcast
    /// </summary>
    [HubMethodName("TaskUpdated")]
    public async Task OnTaskUpdated(int taskId, string taskTitle, bool isCompleted)
    {
        try
        {
            var userId = GetUserId();
            if (userId == null) return;

            var notification = new
            {
                Type = "TaskUpdated",
                TaskId = taskId,
                TaskTitle = taskTitle,
                IsCompleted = isCompleted,
                UserId = userId,
                Timestamp = DateTime.UtcNow,
                Message = isCompleted 
                    ? $"Görev tamamlandı: {taskTitle} ✅" 
                    : $"Görev güncellendi: {taskTitle}"
            };

            // Kullanıcıya real-time bildir
            await Clients.Group($"User_{userId}").SendAsync("TaskUpdate", notification);

            // Eğer task tamamlandıysa achievement notification gönder
            if (isCompleted)
            {
                await SendAchievementNotificationAsync(userId.Value, taskTitle);
            }

            _logger.LogDebug("Task updated notification sent: {TaskId} for user {UserId}", taskId, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting task update");
        }
    }

    /// <summary>
    /// Task silindiğinde real-time broadcast
    /// </summary>
    [HubMethodName("TaskDeleted")]
    public async Task OnTaskDeleted(int taskId, string taskTitle)
    {
        try
        {
            var userId = GetUserId();
            if (userId == null) return;

            var notification = new
            {
                Type = "TaskDeleted",
                TaskId = taskId,
                TaskTitle = taskTitle,
                UserId = userId,
                Timestamp = DateTime.UtcNow,
                Message = $"Görev silindi: {taskTitle}"
            };

            await Clients.Group($"User_{userId}").SendAsync("TaskUpdate", notification);

            _logger.LogDebug("Task deleted notification sent: {TaskId} for user {UserId}", taskId, userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting task deletion");
        }
    }

    #endregion

    #region Notifications

    /// <summary>
    /// Client'tan notification gönderim isteği
    /// </summary>
    [HubMethodName("SendNotification")]
    public async Task SendNotificationToUser(int targetUserId, string message, string type = "Info")
    {
        try
        {
            var senderId = GetUserId();
            var senderName = GetUserName();
            
            if (senderId == null || senderName == null) return;

            var notification = new
            {
                Type = type,
                Message = message,
                SenderId = senderId,
                SenderName = senderName,
                Timestamp = DateTime.UtcNow,
                Id = Guid.NewGuid()
            };

            // Hedef kullanıcıya gönder
            await Clients.Group($"User_{targetUserId}").SendAsync("NotificationReceived", notification);

            // Cache'e de kaydet (offline notification için)
            await CacheNotificationAsync(targetUserId, notification);

            _logger.LogInformation("Notification sent from {SenderId} to {TargetUserId}: {Message}", 
                senderId, targetUserId, message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending notification");
        }
    }

    /// <summary>
    /// Broadcast notification - tüm online kullanıcılara
    /// </summary>
    [HubMethodName("BroadcastNotification")]
    public async Task BroadcastNotification(string message, string type = "Info")
    {
        try
        {
            var senderId = GetUserId();
            var senderName = GetUserName();
            
            if (senderId == null || senderName == null) return;

            // Sadece admin/moderator yetkisi olması gerekebilir
            // Şimdilik basit implementation

            var notification = new
            {
                Type = type,
                Message = message,
                SenderId = senderId,
                SenderName = senderName,
                Timestamp = DateTime.UtcNow,
                Id = Guid.NewGuid(),
                IsBroadcast = true
            };

            await Clients.All.SendAsync("NotificationReceived", notification);

            _logger.LogInformation("Broadcast notification sent by {SenderId}: {Message}", senderId, message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting notification");
        }
    }

    #endregion

    #region Typing Indicators

    /// <summary>
    /// Kullanıcı typing göstergesi (gelecekte chat için)
    /// </summary>
    [HubMethodName("UserTyping")]
    public async Task OnUserTyping(bool isTyping)
    {
        try
        {
            var userId = GetUserId();
            var userName = GetUserName();
            
            if (userId == null || userName == null) return;

            await Clients.Others.SendAsync("UserTypingUpdate", new
            {
                UserId = userId,
                UserName = userName,
                IsTyping = isTyping,
                Timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error broadcasting typing indicator");
        }
    }

    #endregion

    #region Helper Methods

    /// <summary>
    /// JWT token'dan UserId çıkarır
    /// </summary>
    private int? GetUserId()
    {
        var userIdClaim = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                         ?? Context.User?.FindFirst("sub")?.Value;
        
        return int.TryParse(userIdClaim, out var userId) ? userId : null;
    }

    /// <summary>
    /// JWT token'dan UserName çıkarır
    /// </summary>
    private string? GetUserName()
    {
        return Context.User?.FindFirst("firstName")?.Value
               ?? Context.User?.FindFirst(ClaimTypes.GivenName)?.Value;
    }

    /// <summary>
    /// Online kullanıcılar listesini getirir
    /// </summary>
    private List<object> GetOnlineUsersList()
    {
        lock (OnlineUsersLock)
        {
            return OnlineUsers.Values
                .Select(u => new
                {
                    u.UserId,
                    u.UserName,
                    u.ConnectedAt,
                    OnlineDuration = DateTime.UtcNow - u.ConnectedAt
                })
                .ToList<object>();
        }
    }

    /// <summary>
    /// Kullanıcının pending notifications'larını gönderir
    /// </summary>
    private async Task SendPendingNotificationsAsync(int userId)
    {
        try
        {
            var cacheKey = $"notifications:pending:{userId}";
            var pendingNotifications = await _cacheService.GetAsync<List<object>>(cacheKey);
            
            if (pendingNotifications?.Any() == true)
            {
                foreach (var notification in pendingNotifications)
                {
                    await Clients.Caller.SendAsync("NotificationReceived", notification);
                }

                // Pending notifications'ları temizle
                await _cacheService.RemoveAsync(cacheKey);
                
                _logger.LogDebug("Sent {Count} pending notifications to user {UserId}", 
                    pendingNotifications.Count, userId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending pending notifications for user {UserId}", userId);
        }
    }

    /// <summary>
    /// Notification'ı cache'e kaydeder (offline users için)
    /// </summary>
    private async Task CacheNotificationAsync(int userId, object notification)
    {
        try
        {
            var cacheKey = $"notifications:pending:{userId}";
            var existingNotifications = await _cacheService.GetAsync<List<object>>(cacheKey) ?? new List<object>();
            
            existingNotifications.Add(notification);
            
            // En fazla 50 pending notification sakla
            if (existingNotifications.Count > 50)
            {
                existingNotifications = existingNotifications.TakeLast(50).ToList();
            }

            // 7 gün sakla
            await _cacheService.SetAsync(cacheKey, existingNotifications, TimeSpan.FromDays(7));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error caching notification for user {UserId}", userId);
        }
    }

    /// <summary>
    /// Achievement notification gönderir (task completion için)
    /// </summary>
    private async Task SendAchievementNotificationAsync(int userId, string taskTitle)
    {
        try
        {
            // Kullanıcının stats'larını kontrol et
            var stats = await _userService.GetUserStatsAsync(userId);
            
            string? achievementMessage = null;
            
            // Achievement'lar
            if (stats.CompletedTasks == 1)
            {
                achievementMessage = "🎉 İlk görevinizi tamamladınız! Harika başlangıç!";
            }
            else if (stats.CompletedTasks == 10)
            {
                achievementMessage = "🏆 10 görev tamamlandı! Productive user oldunuz!";
            }
            else if (stats.CompletedTasks == 50)
            {
                achievementMessage = "🌟 50 görev tamamlandı! Task Master unvanını kazandınız!";
            }
            else if (stats.CompletedTasks == 100)
            {
                achievementMessage = "💎 100 görev tamamlandı! Efsane seviyeye ulaştınız!";
            }
            else if (stats.TaskCompletionRate >= 90 && stats.CompletedTasks >= 20)
            {
                achievementMessage = "🎯 %90+ completion rate! Mükemmeliyetçi unvanını kazandınız!";
            }

            if (!string.IsNullOrEmpty(achievementMessage))
            {
                var achievementNotification = new
                {
                    Type = "Achievement",
                    Message = achievementMessage,
                    TaskTitle = taskTitle,
                    CompletedTasks = stats.CompletedTasks,
                    CompletionRate = stats.TaskCompletionRate,
                    Timestamp = DateTime.UtcNow,
                    Id = Guid.NewGuid()
                };

                await Clients.Group($"User_{userId}").SendAsync("AchievementUnlocked", achievementNotification);
                
                _logger.LogInformation("Achievement notification sent to user {UserId}: {Message}", 
                    userId, achievementMessage);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending achievement notification for user {UserId}", userId);
        }
    }

    #endregion
}

/// <summary>
/// Online user connection bilgileri
/// </summary>
public class UserConnectionInfo
{
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string ConnectionId { get; set; } = string.Empty;
    public DateTime ConnectedAt { get; set; }
} 