package com.concesionario.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class VehiculoRequest {

    @NotBlank(message = "La marca es obligatoria")
    private String marca;

    @NotBlank(message = "El modelo es obligatorio")
    private String modelo;

    @NotNull
    @Min(1900)
    @Max(2030)
    private Integer año;

    @NotNull
    @DecimalMin("0.0")
    private BigDecimal precio;

    @NotNull
    @Min(0)
    private Integer km;

    @NotBlank
    private String combustible;

    private String descripcion;

    private List<String> imagenes;
}