package com.hawkscope.backend.config;

import com.hawkscope.backend.entity.Organization;
import com.hawkscope.backend.entity.User;
import com.hawkscope.backend.repository.OrganizationRepository;
import com.hawkscope.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final OrganizationRepository orgRepo;
    private final UserRepository userRepo;

    public DataSeeder(OrganizationRepository orgRepo, UserRepository userRepo) {
        this.orgRepo = orgRepo;
        this.userRepo = userRepo;
    }

    @Override
    public void run(String... args) throws Exception {
        if (orgRepo.count() == 0) {
            Organization org = new Organization();
            org.setName("HawkScope Demo");
            org.setCompanySize("medium");
            org.setApiKey("sk_demo_hawkscope123");
            org.setStatus("active");
            org = orgRepo.save(org);

            User admin = new User();
            admin.setOrganization(org);
            admin.setEmail("admin@hawkscope.com");
            // MVP: Contraseña cruda simulando hash temporal. Se cambiará a BCrypt.
            admin.setPasswordHash("admin123");
            admin.setFullName("System Admin");
            admin.setRole("admin");
            admin.setStatus("active");
            userRepo.save(admin);
            
            System.out.println("=========================================");
            System.out.println("🚀 SEMILLA INICIAL CREADA EXITOSAMENTE");
            System.out.println("Organización: HawkScope Demo");
            System.out.println("API Key del Agente: sk_demo_hawkscope123");
            System.out.println("Admin Login: admin@hawkscope.com / admin123");
            System.out.println("=========================================");
        }
    }
}
