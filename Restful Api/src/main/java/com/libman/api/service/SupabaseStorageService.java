package com.libman.api.service;

import com.libman.api.exception.AppException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

/**
 * Uploads files to Supabase Storage buckets, using the service_role key -- a
 * backend-only secret that bypasses Storage's own access rules entirely.
 * Authorization for WHO may upload is already enforced by Spring Security
 * (hasRole('LIBRARIAN')) before this is called; this class only talks to Storage.
 */
@Slf4j
@Service
public class SupabaseStorageService {

    private final RestClient restClient;
    private final String storageUrl;

    public SupabaseStorageService(
            @Value("${app.supabase.storage-url}") String storageUrl,
            @Value("${app.supabase.service-role-key}") String serviceRoleKey) {
        this.storageUrl = storageUrl;
        this.restClient = RestClient.builder()
                .baseUrl(storageUrl)
                .defaultHeader("Authorization", "Bearer " + serviceRoleKey)
                .build();
    }

    public String upload(MultipartFile file, String bucket, String extension) {
        String objectPath = UUID.randomUUID() + "." + extension;
        try {
            restClient.put()
                    .uri("/object/{bucket}/{path}", bucket, objectPath)
                    .contentType(MediaType.parseMediaType(
                            file.getContentType() != null ? file.getContentType() : "application/octet-stream"))
                    .body(file.getBytes())
                    .retrieve()
                    .toBodilessEntity();
        } catch (IOException e) {
            throw new AppException(HttpStatus.BAD_REQUEST, "UPLOAD_FAILED", "Couldn't read the uploaded file.");
        } catch (Exception e) {
            log.error("Supabase Storage upload failed", e);
            throw new AppException(HttpStatus.BAD_GATEWAY, "UPLOAD_FAILED", "Couldn't upload the file. Please try again.");
        }
        return storageUrl + "/object/public/" + bucket + "/" + objectPath;
    }
}
