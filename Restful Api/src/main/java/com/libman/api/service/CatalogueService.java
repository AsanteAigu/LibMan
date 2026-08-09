package com.libman.api.service;

import com.libman.api.domain.Copy;
import com.libman.api.domain.EbookEdition;
import com.libman.api.domain.Title;
import com.libman.api.domain.User;
import com.libman.api.domain.WithdrawalLog;
import com.libman.api.domain.enums.CopyStatus;
import com.libman.api.domain.enums.WithdrawnReason;
import com.libman.api.exception.AppException;
import com.libman.api.repository.CopyRepository;
import com.libman.api.repository.EbookEditionRepository;
import com.libman.api.repository.TitleRepository;
import com.libman.api.repository.UserRepository;
import com.libman.api.repository.WithdrawalLogRepository;
import com.libman.api.web.dto.CatalogueDtos.AddCopyRequest;
import com.libman.api.web.dto.CatalogueDtos.CreateTitleRequest;
import com.libman.api.web.dto.CopyResponse;
import com.libman.api.web.dto.TitleResponse;
import com.libman.api.exception.AppException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CatalogueService {

    private static final String COVERS_BUCKET = "covers";
    private static final Set<String> ALLOWED_COVER_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp");

    private final TitleRepository titleRepository;
    private final CopyRepository copyRepository;
    private final EbookEditionRepository ebookEditionRepository;
    private final WithdrawalLogRepository withdrawalLogRepository;
    private final UserRepository userRepository;
    private final SupabaseStorageService storageService;

    @Transactional(readOnly = true)
    public List<TitleResponse> listTitles(String q) {
        List<Title> titles = titleRepository.search(q == null || q.isBlank() ? null : q);
        List<Integer> titleIds = titles.stream().map(Title::getId).toList();
        Set<Integer> withEbook = titleIds.isEmpty() ? Set.of() : ebookEditionRepository.findTitleIdsWithEbook(titleIds);

        return titles.stream()
                .map(title -> TitleResponse.from(
                        title,
                        copyRepository.findByTitleId(title.getId()),
                        withEbook.contains(title.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public TitleResponse getTitle(Integer id) {
        Title title = titleRepository.findById(id).orElseThrow(() -> AppException.notFound("Title"));
        return TitleResponse.from(title, copyRepository.findByTitleId(id), ebookEditionRepository.existsByTitleId(id));
    }

    @Transactional
    public TitleResponse createTitle(CreateTitleRequest request) {
        Title title = Title.builder()
                .name(request.name())
                .author(request.author())
                .replacementCost(request.replacementCost())
                .build();
        title = titleRepository.save(title);

        if (request.hasEbook()) {
            ebookEditionRepository.save(EbookEdition.builder().title(title).build());
        }

        return TitleResponse.from(title, List.of(), request.hasEbook());
    }

    @Transactional
    public TitleResponse uploadCover(Integer titleId, MultipartFile file) {
        Title title = titleRepository.findById(titleId).orElseThrow(() -> AppException.notFound("Title"));

        String extension = extensionOf(file.getOriginalFilename());
        if (!ALLOWED_COVER_EXTENSIONS.contains(extension)) {
            throw AppException.badRequest("UNSUPPORTED_FORMAT", "Only JPG, PNG, and WEBP images are supported.");
        }

        title.setCoverImageUrl(storageService.upload(file, COVERS_BUCKET, extension));
        title = titleRepository.save(title);

        return TitleResponse.from(title, copyRepository.findByTitleId(titleId), ebookEditionRepository.existsByTitleId(titleId));
    }

    private String extensionOf(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
    }

    @Transactional
    public CopyResponse addCopy(Integer titleId, AddCopyRequest request) {
        Title title = titleRepository.findById(titleId).orElseThrow(() -> AppException.notFound("Title"));
        Copy copy = Copy.builder()
                .title(title)
                .shelfLocation(request.shelfLocation())
                .arrangementDetails(request.arrangementDetails())
                .build();
        return CopyResponse.from(copyRepository.save(copy));
    }

    @Transactional
    public CopyResponse withdrawCopy(Integer copyId, WithdrawnReason reason, Integer librarianId) {
        Copy copy = copyRepository.findById(copyId).orElseThrow(() -> AppException.notFound("Copy"));
        if (copy.getStatus() == CopyStatus.on_loan || copy.getStatus() == CopyStatus.on_hold) {
            throw AppException.conflict("COPY_IN_USE", "This copy is currently on loan or on hold and can't be withdrawn.");
        }

        copy.setStatus(CopyStatus.withdrawn);
        copy.setWithdrawnReason(reason);
        copy = copyRepository.save(copy);

        User librarian = userRepository.findById(librarianId).orElseThrow(() -> AppException.notFound("Librarian"));
        withdrawalLogRepository.save(WithdrawalLog.builder().copy(copy).librarian(librarian).reason(reason).build());

        return CopyResponse.from(copy);
    }
}
