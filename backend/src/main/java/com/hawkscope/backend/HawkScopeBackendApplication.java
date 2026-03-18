package com.hawkscope.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;

// TODO: Quita este (exclude = ...) cuando el equipo de base de datos te entregue las credenciales de MySQL reales.
@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class, HibernateJpaAutoConfiguration.class})
public class HawkScopeBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(HawkScopeBackendApplication.class, args);
	}

}
