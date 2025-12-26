package com.andzoa.gestionmateriel.entity;

public enum StatutBesoin {
    CRÉÉ("Créé"),
    VALIDATION("En validation"),
    VISA("Visé"),
    ACCEPTÉ("Accepté"),
    REFUSÉ("Refusé");
    
    private final String libelle;
    
    StatutBesoin(String libelle) {
        this.libelle = libelle;
    }
    
    public String getLibelle() {
        return libelle;
    }
}

