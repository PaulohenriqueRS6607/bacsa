package com.example.livros.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "favoritos")
public class Favorito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // ID do dispositivo (para identificar usuário sem precisar de login/perfil)
    @Column(nullable = false, length = 500)
    private String deviceId;
    
    // ID do livro no Google Books API
    @Column(nullable = false, length = 500)
    private String googleBooksId;
    
    // Título do livro
    @Column(nullable = false, length = 1000)
    private String titulo;
    
    // Autor do livro
    @Column(length = 1000)
    private String autor;
    
    // URL da imagem de capa
    @Column(length = 2000)
    private String imagemUrl;
    
    // Descrição do livro
    @Column(length = 5000)
    private String descricao;
    
    // Data de publicação
    private String dataPublicacao;
    
    @Column(nullable = false)
    private LocalDateTime dataCriacao = LocalDateTime.now();

    // Constructors
    public Favorito() {
    }

    public Favorito(String deviceId, String googleBooksId, String titulo, String autor, 
                  String imagemUrl, String descricao, String dataPublicacao) {
        this.deviceId = deviceId;
        this.googleBooksId = googleBooksId;
        this.titulo = titulo;
        this.autor = autor;
        this.imagemUrl = imagemUrl;
        this.descricao = descricao;
        this.dataPublicacao = dataPublicacao;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }

    public String getGoogleBooksId() {
        return googleBooksId;
    }

    public void setGoogleBooksId(String googleBooksId) {
        this.googleBooksId = googleBooksId;
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

    public String getImagemUrl() {
        return imagemUrl;
    }

    public void setImagemUrl(String imagemUrl) {
        this.imagemUrl = imagemUrl;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getDataPublicacao() {
        return dataPublicacao;
    }

    public void setDataPublicacao(String dataPublicacao) {
        this.dataPublicacao = dataPublicacao;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }
}
