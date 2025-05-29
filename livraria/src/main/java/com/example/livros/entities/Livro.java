package com.example.livros.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_livros")
public class Livro  {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 1000)
    private String titulo;
    
    @Column(length = 1000)
    private String autor;
    
    private String genero;
    
    @Column(length = 2000)
    private String capa;
    
    private LocalDateTime dataPublicacao;
    
    @Column(length = 5000)
    private String descricao;
    
    // Campos adicionados da tabela Favorito
    @Column(length = 500)
    private String deviceId;
    
    @Column(length = 500)
    private String googleBooksId;
    
    @Column(length = 2000)
    private String imagemUrl;
    
    private String dataPublicacaoTexto;
    
    @Column(nullable = false)
    private Boolean favorito = false;
    
    @Column(nullable = false)
    private LocalDateTime dataCriacao = LocalDateTime.now();

    public Livro() {
    }

    public Livro(Long id, String titulo, String autor, String genero, String capa, LocalDateTime dataPublicacao, String descricao) {
        this.id = id;
        this.titulo = titulo;
        this.autor = autor;
        this.genero = genero;
        this.capa = capa;
        this.dataPublicacao = dataPublicacao;
        this.descricao = descricao;
    }
    
    // Construtor para criar livro a partir de dados da API Google Books
    public Livro(String deviceId, String googleBooksId, String titulo, String autor, 
                 String imagemUrl, String descricao, String dataPublicacaoTexto) {
        this.deviceId = deviceId;
        this.googleBooksId = googleBooksId;
        this.titulo = titulo;
        this.autor = autor;
        this.imagemUrl = imagemUrl;
        this.capa = imagemUrl; // Usar o mesmo campo para compatibilidade
        this.descricao = descricao;
        this.dataPublicacaoTexto = dataPublicacaoTexto;
        this.favorito = true;
    }

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

    public String getImagemUrl() {
        return imagemUrl;
    }

    public void setImagemUrl(String imagemUrl) {
        this.imagemUrl = imagemUrl;
    }

    public String getDataPublicacaoTexto() {
        return dataPublicacaoTexto;
    }

    public void setDataPublicacaoTexto(String dataPublicacaoTexto) {
        this.dataPublicacaoTexto = dataPublicacaoTexto;
    }

    public Boolean getFavorito() {
        return favorito;
    }

    public void setFavorito(Boolean favorito) {
        this.favorito = favorito;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }
}