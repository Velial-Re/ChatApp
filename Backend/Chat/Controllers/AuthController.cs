using System.Security.Claims;
using Chat.Data;
using Chat.Models;
using Chat.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Chat.Controllers;

[ApiController]
[Route("api/auth")]
[Produces("application/json")]
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
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
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

            // Обновление refresh токена на сервере
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            await _context.SaveChangesAsync();

            Response.Cookies.Append("access_token", token, new CookieOptions
            {
                HttpOnly = true,
                Secure = false,
                SameSite = SameSiteMode.Lax,
                Expires = DateTimeOffset.Now.AddMinutes(30),
                Domain = "localhost"
            });

            Response.Cookies.Append("refresh_token", refreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = false,
                SameSite = SameSiteMode.Lax,
                Expires = DateTime.UtcNow.AddDays(7),
                Domain = "localhost"
            });

            return Ok(new
            {
                Username = user.UserName,
                ExpiresAt = DateTime.UtcNow.AddMinutes(30)
            });
        }
        catch (Exception e)
        {
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("user")]
    [Authorize]
    public async Task<IActionResult> GetCurrentUser()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var user = await _context.Users.FindAsync(Guid.Parse(userId!));

            return Ok(new
            {
                Username = user.UserName
            });
        }
        catch (Exception e)
        {
            Console.WriteLine($"Error get user ${e}");
            throw;
        }
    }

    [HttpPost("logout")]
    [Authorize]
    public IActionResult Logout()
    {
        try
        {
            Response.Cookies.Delete("access_token", new CookieOptions
            {
                HttpOnly = true,
                Secure = false,
                SameSite = SameSiteMode.Lax,
                Domain = "localhost"
            });

            Response.Cookies.Delete("refresh_token", new CookieOptions
            {
                HttpOnly = true,
                Secure = false,
                SameSite = SameSiteMode.Lax,
                Domain = "localhost"
            });
            return Ok(new { message = "Logged out" });
        }
        catch (Exception e)
        {
            Console.WriteLine($"Error logout ${e}");
            throw;
        }
    }

    [HttpGet("token")]
    [Authorize]
    public IActionResult GetToken()
    {
        var token = Request.Cookies["access_token"];

        if (string.IsNullOrEmpty(token))
        {
            return Unauthorized("Token not found");
        }

        return Ok(new
        {
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddMinutes(30)
        });
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> Refresh()
    {
        var refreshToken = Request.Cookies["refresh_token"];
        if (string.IsNullOrEmpty(refreshToken))
            return BadRequest("Invalid refresh token");

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);

        if (user == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            return BadRequest("Invalid refresh token");
        
        var newToken = _jwtService.GenerateJwtToken(user);
        var newRefreshToken = _jwtService.GenerateRefreshToken();
        
        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
        await _context.SaveChangesAsync();

        // Установка куки
        Response.Cookies.Append("access_token", newToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = false,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddMinutes(15)
        });

        Response.Cookies.Append("refresh_token", newRefreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = false,
            SameSite = SameSiteMode.Strict,
            Expires = DateTime.UtcNow.AddDays(7)
        });

        return Ok(new
        {
            Username = user.UserName
        });
    }
}