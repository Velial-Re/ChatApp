using System.ComponentModel.DataAnnotations;

namespace Chat.Models;

public class User
{
    public Guid Id { get; set; }
    [Required]
    [MaxLength(50)]
    public string UserName { get; set; }
    [Required]
    [EmailAddress]
    [MaxLength(100)]
    public string Email { get; set; }
    [Required]
    public string PasswordHash { get; set; }

    public ICollection<ChatRoom> ChatRooms { get; set; } = new List<ChatRoom>();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }
}