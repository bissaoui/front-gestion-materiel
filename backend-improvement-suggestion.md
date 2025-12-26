# Amélioration suggérée pour le backend

## Problème identifié

La méthode `isDirecteurDAF()` dans `BesoinExprimeServiceImpl` ne détecte pas correctement le Directeur DAF car elle cherche "daf" dans le **poste**, alors que le poste est simplement "directeur" et la direction est "direction administrative et financière".

## Solution recommandée

### 1. Améliorer la méthode `isDirecteurDAF()` dans le Service

```java
/**
 * Vérifie si un agent est directeur DAF
 * Le Directeur DAF est identifié par :
 * - Poste contenant "directeur"
 * - Direction contenant "daf", "administratif", "financier", etc.
 */
private boolean isDirecteurDAF(Agent agent) {
    if (agent.getPoste() == null) {
        return false;
    }
    
    String poste = agent.getPoste().toLowerCase();
    boolean isDirecteur = poste.contains("directeur");
    
    if (!isDirecteur) {
        return false;
    }
    
    // Vérifier aussi la direction si disponible
    if (agent.getDirection() != null && agent.getDirection().getNom() != null) {
        String directionNom = agent.getDirection().getNom().toLowerCase();
        return directionNom.contains("daf") || 
               directionNom.contains("administratif") && directionNom.contains("financier") ||
               directionNom.contains("administrative") && directionNom.contains("financière");
    }
    
    // Fallback : vérifier dans le poste (pour compatibilité)
    return poste.contains("daf") || 
           poste.contains("affaires financières") ||
           poste.contains("administratif") && poste.contains("financier");
}
```

### 2. Améliorer le contrôleur pour retourner les messages d'erreur

```java
@PutMapping("/{id}/viser")
public ResponseEntity<?> viserBesoin(@PathVariable Long id) {
    try {
        String currentUsername = getCurrentUsername();
        BesoinExprimeDTO besoin = besoinExprimeService.viserBesoin(id, currentUsername);
        return ResponseEntity.ok(besoin);
    } catch (RuntimeException e) {
        // Retourner le message d'erreur dans le body pour faciliter le débogage
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("message", e.getMessage());
        errorResponse.put("error", e.getClass().getSimpleName());
        return ResponseEntity.badRequest().body(errorResponse);
    } catch (Exception e) {
        return ResponseEntity.notFound().build();
    }
}
```

### 3. Améliorer la méthode `viserBesoin()` pour vérifier aussi la direction

```java
@Override
@Transactional
public BesoinExprimeDTO viserBesoin(Long id, String currentUsername) {
    BesoinExprime besoin = besoinExprimeRepository.findById(id)
            .orElseThrow(() -> new NotFoundException("BesoinExprime", id));
    
    Agent currentAgent = agentRepository.findAgentByUsername(currentUsername)
            .orElseThrow(() -> new RuntimeException("Agent non trouvé avec le username: " + currentUsername));
    
    // Vérifier le statut
    if (besoin.getStatut() != StatutBesoin.VALIDATION) {
        throw new RuntimeException("Seuls les besoins avec le statut VALIDATION peuvent être visés. Statut actuel: " + besoin.getStatut());
    }
    
    // Vérifier que l'agent est directeur DAF
    if (!isDirecteurDAF(currentAgent)) {
        throw new RuntimeException("Seul le Directeur DAF peut viser les besoins. Votre poste: " + currentAgent.getPoste() + ", Direction: " + (currentAgent.getDirection() != null ? currentAgent.getDirection().getNom() : "N/A"));
    }
    
    besoin.setStatut(StatutBesoin.VISA);
    besoin.setDateVisa(LocalDateTime.now());
    besoin.setViseur(currentAgent);
    
    BesoinExprime updated = besoinExprimeRepository.save(besoin);
    return mapper.toDTO(updated);
}
```

## Test de la détection

Pour vérifier si vous êtes bien détecté comme Directeur DAF, ajoutez un log dans le service :

```java
private boolean isDirecteurDAF(Agent agent) {
    if (agent.getPoste() == null) {
        System.out.println("DEBUG isDirecteurDAF: poste est null");
        return false;
    }
    
    String poste = agent.getPoste().toLowerCase();
    boolean isDirecteur = poste.contains("directeur");
    
    System.out.println("DEBUG isDirecteurDAF: poste=" + poste + ", isDirecteur=" + isDirecteur);
    
    if (!isDirecteur) {
        return false;
    }
    
    // Vérifier aussi la direction
    if (agent.getDirection() != null && agent.getDirection().getNom() != null) {
        String directionNom = agent.getDirection().getNom().toLowerCase();
        System.out.println("DEBUG isDirecteurDAF: direction=" + directionNom);
        boolean isDAF = directionNom.contains("daf") || 
                       (directionNom.contains("administratif") && directionNom.contains("financier")) ||
                       (directionNom.contains("administrative") && directionNom.contains("financière"));
        System.out.println("DEBUG isDirecteurDAF: isDAF=" + isDAF);
        return isDAF;
    }
    
    // Fallback
    boolean fallback = poste.contains("daf") || poste.contains("affaires financières");
    System.out.println("DEBUG isDirecteurDAF: fallback=" + fallback);
    return fallback;
}
```

