package com.st6.weeklycommit.controller;

import com.st6.weeklycommit.model.dto.LoginRequest;
import com.st6.weeklycommit.model.dto.LoginResponse;
import com.st6.weeklycommit.repository.TeamMemberRepository;
import com.st6.weeklycommit.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthenticationManager authManager;
    private final JwtService jwtService;
    private final TeamMemberRepository memberRepo;

    public AuthController(AuthenticationManager authManager, JwtService jwtService, TeamMemberRepository memberRepo) {
        this.authManager = authManager;
        this.jwtService = jwtService;
        this.memberRepo = memberRepo;
    }

    @GetMapping("/health")
    public java.util.Map<String, String> health() {
        return java.util.Map.of("status", "UP");
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest req) {
        try {
            authManager.authenticate(new UsernamePasswordAuthenticationToken(req.email(), req.password()));
        } catch (BadCredentialsException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        var member = memberRepo.findByEmail(req.email())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        String token = jwtService.generateToken(member);
        return new LoginResponse(token, member.getId(), member.getName(), member.getRole());
    }
}
