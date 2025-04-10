using System.ComponentModel.DataAnnotations;

namespace Chat.Models;

public class ChatRoom
{
    public Guid Id { get; set; }
    [MaxLength(50)]
    public string Name { get; set; }

    public ICollection<User> Users { get; set; } = new List<User>();
    public ICollection<Message> Messages { get; set; } = new List<Message>();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}