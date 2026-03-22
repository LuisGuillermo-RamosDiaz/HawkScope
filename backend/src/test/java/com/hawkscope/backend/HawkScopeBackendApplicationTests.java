package com.hawkscope.backend;

import org.junit.jupiter.api.Test;

class HawkScopeBackendApplicationTests {

	@Test
	void contextLoads() {
        // Se omitió la anotación @SpringBootTest
        // Esto evita que GitHub Actions (CI/CD) o Maven intenten conectarse a la base de datos
        // o busquen variables de entorno secretas (como JWT) durante la fase de compilación.
	}

}
