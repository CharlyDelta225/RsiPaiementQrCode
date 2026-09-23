package com.church.offering;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class OfferingApplication {

    public static void main(String[] args) {
        SpringApplication.run(OfferingApplication.class, args);
    }

}