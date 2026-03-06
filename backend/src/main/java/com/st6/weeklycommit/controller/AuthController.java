package com.st6.weeklycommit.controller;

import com.st6.weeklycommit.model.dto.GoogleLoginRequest;
import com.st6.weeklycommit.model.dto.LoginRequest;
import com.st6.weeklycommit.model.dto.LoginResponse;
import com.st6.weeklycommit.model.entity.Team;
import com.st6.weeklycommit.model.entity.TeamMember;
import com.st6.weeklycommit.repository.TeamMemberRepository;
import com.st6.weeklycommit.repository.TeamRepository;
import com.st6.weeklycommit.security.JwtService;
import com.st6.weeklycommit.service.GoogleTokenVerifier;
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
    private final TeamRepository teamRepo;
    private final GoogleTokenVerifier googleTokenVerifier;

    public AuthController(AuthenticationManager authManager, JwtService jwtService,
                          TeamMemberRepository memberRepo, TeamRepository teamRepo,
                          GoogleTokenVerifier googleTokenVerifier) {
        this.authManager = authManager;
        this.jwtService = jwtService;
        this.memberRepo = memberRepo;
        this.teamRepo = teamRepo;
        this.googleTokenVerifier = googleTokenVerifier;
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

    @PostMapping("/oauth2/google")
    public LoginResponse googleLogin(@RequestBody GoogleLoginRequest req) {
        GoogleTokenVerifier.GoogleUser googleUser;
        try {
            googleUser = googleTokenVerifier.verify(req.credential());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Google token");
        }

        // Find by Google ID first, then by email, or create new
        var member = memberRepo.findByGoogleId(googleUser.googleId())
                .or(() -> memberRepo.findByEmail(googleUser.email()))
                .orElseGet(() -> createMemberFromGoogle(googleUser));

        // Link Google ID if not yet linked (found by email)
        if (member.getGoogleId() == null) {
            member.setGoogleId(googleUser.googleId());
        }
        if (googleUser.pictureUrl() != null) {
            member.setAvatarUrl(googleUser.pictureUrl());
        }
        memberRepo.save(member);

        String token = jwtService.generateToken(member);
        return new LoginResponse(token, member.getId(), member.getName(), member.getRole());
    }

    private TeamMember createMemberFromGoogle(GoogleTokenVerifier.GoogleUser googleUser) {
        // Assign to the first team (default team)
        Team defaultTeam = teamRepo.findAll().stream().findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "No team exists"));

        TeamMember member = new TeamMember();
        member.setName(googleUser.name());
        member.setEmail(googleUser.email());
        member.setGoogleId(googleUser.googleId());
        member.setAvatarUrl(googleUser.pictureUrl());
        member.setRole("MEMBER");
        member.setTeam(defaultTeam);
        return memberRepo.save(member);
    }
}
