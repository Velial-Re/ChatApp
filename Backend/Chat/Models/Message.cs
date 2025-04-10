using System.ComponentModel.DataAnnotations;

namespace Chat.Models;

public class Message
{
    public Guid Id { get; set; }
    [MaxLength(500)]
    public string Content { get; set; }
    public DateTime SentAt { get; set; } = DateTime.UtcNow;

    public Guid UserId { get; set; }
    public User User { get; set; }

    public Guid ChatRoomId { get; set; }
    public ChatRoom ChatRoom { get; set; }
}