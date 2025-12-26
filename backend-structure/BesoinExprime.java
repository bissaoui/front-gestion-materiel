package com.andzoa.gestionmateriel.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "besoins_exprimes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BesoinExprime {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "agent_id", nullable = false)
    private Agent agent;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "type_materiel_id", nullable = false)
    private TypeMateriel typeMateriel;
    
    @Column(name = "date_besoin", nullable = false)
    private LocalDate dateBesoin;
    
    @Column(name = "raison", nullable = false, length = 1000)
    private String raison;
    
    @Column(name = "observation", length = 2000)
    private String observation;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false, length = 20)
    private StatutBesoin statut = StatutBesoin.CRÉÉ;
    
    @Column(name = "date_creation", nullable = false, updatable = false)
    private LocalDateTime dateCreation;
    
    @Column(name = "date_validation")
    private LocalDateTime dateValidation;
    
    @Column(name = "date_visa")
    private LocalDateTime dateVisa;
    
    @Column(name = "date_decision")
    private LocalDateTime dateDecision;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "validateur_id")
    private Agent validateur;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "viseur_id")
    private Agent viseur;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "decideur_id")
    private Agent decideur;
    
    @PrePersist
    protected void onCreate() {
        dateCreation = LocalDateTime.now();
    }
}

