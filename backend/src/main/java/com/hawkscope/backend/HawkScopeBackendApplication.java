package com.hawkscope.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// TODO: Quita este (excludeName = ...) cuando el equipo de base de datos te entregue las credenciales de MySQL reales.
@SpringBootApplication(excludeName = {
    "org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration",
    "org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration"
})
public class HawkScopeBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(HawkScopeBackendApplication.class, args);
	}

}
