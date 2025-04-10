using System.ComponentModel.DataAnnotations;

namespace Chat.Models;

public class UserRegistration
{
    [Required]
    public string Username { get; set; }
    
    [Required]
    [EmailAddress]
    public string Email { get; set; }
    
    [Required]
    [MinLength(8)]
    public string Password { get; set; }
}