using System.Security.Claims;
using Chat.Data;
using Chat.Models;
using Chat.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chat.Controllers;
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IPasswordHasher _passwordHasher;
    private readonly JwtService _jwtService;

    public AuthController(AppDbContext context, IPasswordHasher passwordHasher, JwtService jwtService)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _jwtService = jwtService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] UserRegistration model)
    {
        if (await _context.Users.AnyAsync(us => us.UserName == model.Username))
        {
            return BadRequest("Username already exists");
        }

        if (await _context.Users.AnyAsync(us => us.Email == model.Email))
        {
            return BadRequest("Email already used");
        }

        var user = new User
        {
            UserName = model.Username,
            Email = model.Email,
            PasswordHash = _passwordHasher.HashPassword(model.Password),
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        
        return Ok(new { message = "Registration successful" });
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] UserLogin model)
    {
        try
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(us => us.UserName == model.Username);

            if (user == null || !_passwordHasher.VerifyPassword(user.PasswordHash, model.Password)) 
                return Unauthorized("Invalid username or password");

            var token = _jwtService.GenerateJwtToken(user);
            var refreshToken = _jwtService.GenerateRefreshToken();

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

            await _context.SaveChangesAsync();
            Response.Headers.Append("Access-Control-Allow-Origin", "http://localhost:5173");
            Response.Headers.Append("Access-Control-Allow-Credentials", "true");
            return Ok(new AuthResponse
            {
                Token = token,
                RefreshToken = refreshToken,
                ExpiresAt = DateTime.UtcNow.AddMinutes(30),
                Username = user.UserName
            });
        }
        catch (Exception e)
        {
            Console.Error.WriteLine($"Ошибка авторизации: {e}");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] AuthResponse model)
    {
        var principal = _jwtService.GetPrincipalFromExpiredToken(model.Token);
        var userId = Guid.Parse(principal.FindFirst(ClaimTypes.NameIdentifier)?.Value);
        var user = await _context.Users.FindAsync(userId);

        if (user == null || user.RefreshToken != model.RefreshToken ||
            user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            return BadRequest("Invalid refresh token");
        
        var newToken = _jwtService.GenerateJwtToken(user);
        var newRefreshToken = _jwtService.GenerateRefreshToken();

        user.RefreshToken = newRefreshToken;
        await _context.SaveChangesAsync();

        return Ok(new AuthResponse
        {
            Token = newToken,
            RefreshToken = newRefreshToken,
            ExpiresAt = DateTime.UtcNow.AddMinutes(30),
            Username = user.UserName
        });
    }
}