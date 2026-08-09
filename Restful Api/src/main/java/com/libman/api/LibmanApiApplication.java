package com.libman.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class LibmanApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(LibmanApiApplication.class, args);
	}

}
