package com.concesionario.controller;

import com.concesionario.dto.VehiculoRequest;
import com.concesionario.entity.Vehiculo;
import com.concesionario.repository.VehiculoRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehiculos")
@RequiredArgsConstructor
public class VehiculoController {

    private final VehiculoRepository vehiculoRepository;

    // ── PÚBLICO ──────────────────────────────────────────────────────────────

    @GetMapping
    public List<Vehiculo> getAll() {
        return vehiculoRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Vehiculo> getById(@PathVariable Long id) {
        return vehiculoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ── SOLO ADMIN ────────────────────────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Vehiculo> create(@Valid @RequestBody VehiculoRequest req) {
        Vehiculo v = Vehiculo.builder()
                .marca(req.getMarca())
                .modelo(req.getModelo())
                .año(req.getAño())
                .precio(req.getPrecio())
                .km(req.getKm())
                .combustible(req.getCombustible())
                .descripcion(req.getDescripcion())
                .imagenes(req.getImagenes() != null ? req.getImagenes() : List.of())
                .build();
        return ResponseEntity.ok(vehiculoRepository.save(v));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Vehiculo> update(@PathVariable Long id, @Valid @RequestBody VehiculoRequest req) {
        return vehiculoRepository.findById(id).map(v -> {
            v.setMarca(req.getMarca());
            v.setModelo(req.getModelo());
            v.setAño(req.getAño());
            v.setPrecio(req.getPrecio());
            v.setKm(req.getKm());
            v.setCombustible(req.getCombustible());
            v.setDescripcion(req.getDescripcion());
            v.setImagenes(req.getImagenes() != null ? req.getImagenes() : List.of());
            return ResponseEntity.ok(vehiculoRepository.save(v));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!vehiculoRepository.existsById(id))
            return ResponseEntity.notFound().build();
        vehiculoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}