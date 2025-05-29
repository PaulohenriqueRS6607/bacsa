package com.example.livros.dto;

import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "DTO que representa os dados de um livro")
public class LivroDTO {

    @Schema(description = "ID único do livro", example = "1")
    private Long id;

    @Schema(description = "Título do livro", example = "O Senhor dos Anéis")
    private String titulo;

    @Schema(description = "Nome do autor", example = "J.R.R. Tolkien")
    private String autor;

    @Schema(description = "Gênero do livro", example = "Fantasia")
    private String genero;

    @Schema(description = "URL da imagem da capa", example = "https://example.com/imagens/senhor-dos-aneis.jpg")
    private String capa;

    @Schema(description = "Data de publicação do livro", example = "1954-07-29T00:00:00")
    private LocalDateTime dataPublicacao;

    @Schema(description = "Descrição do livro", example = "Uma épica aventura pela Terra Média.")
    private String descricao;

    // Getters e Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }

    public String getAutor() {
        return autor;
    }

    public void setAutor(String autor) {
        this.autor = autor;
    }

    public String getGenero() {
        return genero;
    }

    public void setGenero(String genero) {
        this.genero = genero;
    }

    public String getCapa() {
        return capa;
    }

    public void setCapa(String capa) {
        this.capa = capa;
    }

    public LocalDateTime getDataPublicacao() {
        return dataPublicacao;
    }

    public void setDataPublicacao(LocalDateTime dataPublicacao) {
        this.dataPublicacao = dataPublicacao;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }


}
