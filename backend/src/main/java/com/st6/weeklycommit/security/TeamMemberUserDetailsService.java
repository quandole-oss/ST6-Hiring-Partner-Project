package com.st6.weeklycommit.security;

import com.st6.weeklycommit.repository.TeamMemberRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TeamMemberUserDetailsService implements UserDetailsService {

    private final TeamMemberRepository memberRepo;

    public TeamMemberUserDetailsService(TeamMemberRepository memberRepo) {
        this.memberRepo = memberRepo;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        var member = memberRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));
        return new User(
                member.getEmail(),
                member.getPasswordHash() != null ? member.getPasswordHash() : "",
                List.of(new SimpleGrantedAuthority("ROLE_" + member.getRole()))
        );
    }
}
