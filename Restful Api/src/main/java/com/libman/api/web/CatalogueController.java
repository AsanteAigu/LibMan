package com.libman.api.web;

import com.libman.api.service.CatalogueService;
import com.libman.api.web.dto.CatalogueDtos.AddCopyRequest;
import com.libman.api.web.dto.CatalogueDtos.CreateTitleRequest;
import com.libman.api.web.dto.CopyResponse;
import com.libman.api.web.dto.TitleResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/titles")
@RequiredArgsConstructor
public class CatalogueController {

    private final CatalogueService catalogueService;

    @GetMapping
    public List<TitleResponse> list(@RequestParam(required = false) String q) {
        return catalogueService.listTitles(q);
    }

    @GetMapping("/{id}")
    public TitleResponse get(@PathVariable Integer id) {
        return catalogueService.getTitle(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('LIBRARIAN')")
    @ResponseStatus(HttpStatus.CREATED)
    public TitleResponse create(@Valid @RequestBody CreateTitleRequest request) {
        return catalogueService.createTitle(request);
    }

    @PostMapping("/{titleId}/copies")
    @PreAuthorize("hasRole('LIBRARIAN')")
    @ResponseStatus(HttpStatus.CREATED)
    public CopyResponse addCopy(@PathVariable Integer titleId, @RequestBody AddCopyRequest request) {
        return catalogueService.addCopy(titleId, request);
    }

    @PostMapping("/{id}/cover")
    @PreAuthorize("hasRole('LIBRARIAN')")
    public TitleResponse uploadCover(@PathVariable Integer id, @RequestParam("file") MultipartFile file) {
        return catalogueService.uploadCover(id, file);
    }
}
