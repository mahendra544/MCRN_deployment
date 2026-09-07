package com.mcrn.auth.config;

import com.mcrn.auth.model.Role;
import com.mcrn.auth.model.User;
import com.mcrn.auth.repository.UserRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminSeeder {

    @Bean
    CommandLineRunner seedAdmin(
            UserRepository repo,
            PasswordEncoder encoder,

            @Value("${app.admin.username}")
            String username,

            @Value("${app.admin.password}")
            String password,

            @Value("${app.admin.email}")
            String email) {

        return args -> {

            if (!repo.existsByUsernameIgnoreCase(username)) {

                User u = new User();

                u.setUsername(username);
                u.setName("System Administrator");
                u.setEmail(email);

                u.setPasswordHash(
                        encoder.encode(password)
                );

                u.setRole(Role.ADMIN);
                u.setVerified(true);
                u.setActive(true);

                repo.save(u);

                System.out.println(
                        "[MCRN] Admin seeded: username="
                                + username
                );
            }
        };
    }
}