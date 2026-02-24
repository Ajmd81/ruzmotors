package com.concesionario.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vehiculos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehiculo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String marca;

    @Column(nullable = false)
    private String modelo;

    @Column(nullable = false)
    private Integer año;

    @Column(nullable = false)
    private BigDecimal precio;

    @Column(nullable = false)
    private Integer km;

    @Column(nullable = false)
    private String combustible;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    @ElementCollection
    @CollectionTable(name = "vehiculo_imagenes", joinColumns = @JoinColumn(name = "vehiculo_id"))
    @Column(name = "imagen_url", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> imagenes = new ArrayList<>();
}