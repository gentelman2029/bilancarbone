# Module CBAM Compliance - Diagnostic et Plan d'Amélioration

## 🔍 Diagnostic de l'État Actuel

### Cartographie du Module

#### Structure des Fichiers

**Pages principales :**
- `src/pages/CBAM.tsx` - Point d'entrée principal du module
- `src/components/CBAMDashboard.tsx` - Tableau de bord central (407 lignes)

**Composants métier :**
- `src/components/CBAMReports.tsx` - Gestion des rapports (411 lignes)
- `src/components/CBAMCalculator.tsx` - Calculateur d'émissions (317 lignes) 
- `src/components/CBAMChecker.tsx` - Vérificateur de conformité (473 lignes)
- `src/components/CBAMProductForm.tsx` - Formulaire produits (377 lignes)
- `src/components/CBAMFileUpload.tsx` - Upload de documents (658 lignes)
- `src/components/CBAMSchedules.tsx` - Calendrier des échéances (919 lignes)
- `src/components/CBAMSectorModels.tsx` - Modèles sectoriels (232 lignes)
- `src/components/CBAMBulkImport.tsx` - Import en lot (181 lignes)

**Base de données :**
- ❌ **CRITIQUE**: Aucune table CBAM dans la base Supabase existante
- ❌ **CRITIQUE**: Toutes les données sont mockées côté client

### Analyse des Flux Métiers Actuels

#### 1. Gestion des Produits
- ✅ Interface de création/édition de produits CBAM
- ❌ Pas de persistance en base de données
- ❌ Données sectorielles hardcodées
- ❌ Pas de validation des codes CN8

#### 2. Calculs d'Émissions
- ✅ Calculateur basique avec Scopes 1, 2, 3
- ❌ Facteurs d'émissions hardcodés et obsolètes
- ❌ Pas de différenciation ACTUAL/DEFAULT/HYBRID
- ❌ Pas de validation des méthodes de calcul

#### 3. Reporting
- ✅ Interface de génération de rapports
- ❌ Pas de format conforme aux templates UE
- ❌ Pas de gestion des périodes trimestrielles
- ❌ Export limité (CSV basique)

#### 4. Upload de Documents
- ✅ Interface drag&drop fonctionnelle
- ❌ Pas de stockage persistant des fichiers
- ❌ Pas de validation/vérification des documents

#### 5. Calendrier des Échéances
- ✅ Interface de suivi des deadlines
- ❌ Pas de calcul automatique des dates légales
- ❌ Pas d'intégration avec les obligations réglementaires

## 🚨 Bugs Identifiés et Dettes Techniques

### Critiques (Bloquants)
1. **Absence de persistance de données** - Toutes les données sont perdues au rechargement
2. **Pas d'intégration Supabase** - Module déconnecté de la base de données
3. **Facteurs d'émissions obsolètes** - Hardcodés, non conformes aux dernières données UE
4. **Pas d'authentification** - Accès libre sans contrôle utilisateur

### Majeurs (Fonctionnalité)
1. **Calculs non conformes CBAM** - Formules simplifiées non réglementaires
2. **Export non standard** - Format CSV basique au lieu du template UE officiel
3. **Pas de gestion des phases** - Transitoire (2023-2025) vs Opérationnelle (2026+)
4. **Validation insuffisante** - Pas de contrôles métier sur les données saisies

### Mineurs (UX/Performance)
1. **Interface non responsive** sur certains écrans
2. **Pas de pagination** sur les listes importantes
3. **Messages d'erreur génériques** peu informatifs
4. **Pas de loading states** sur les actions longues

## 📋 Écarts vs Règlement CBAM (UE) 2023/956

### Phase Transitoire (2023-2025)
❌ **Reporting trimestriel** - Pas implémenté
❌ **Émissions directes/indirectes** - Distinction manquante
❌ **Méthodes ACTUAL/DEFAULT** - Non différenciées
❌ **Format de rapport UE** - Template officiel manquant
❌ **Secteurs complets** - Seuls 4/6 secteurs partiellement couverts

### Phase Opérationnelle (2026+)
❌ **Obligation financière** - Calcul manquant
❌ **Certificats CBAM** - Gestion inexistante  
❌ **Prix carbone d'origine** - Déduction non implémentée
❌ **Taux de change ECB** - Pas d'intégration
❌ **Prix EU ETS** - Source de données manquante

### Données Manquantes
❌ **Codes CN8 complets** - Liste partielle hardcodée
❌ **Facteurs par défaut UE** - Données officielles manquantes
❌ **Pays/mécanismes carbone** - Mapping incomplet
❌ **Seuils d'exemption** - Valeurs non paramétrées

## 🎯 Plan d'Amélioration par Itérations

### Phase 1: Fondations (Semaine 1-2) - CRITIQUE
**Objectif**: Établir la persistance des données et l'architecture de base

#### 1.1 Schéma de Base de Données
```sql
-- Tables principales
CREATE TABLE cbam_importers (EORI, country, company_name...)
CREATE TABLE cbam_products (CN8, sector, description...)  
CREATE TABLE cbam_shipments (dates, volumes, origins...)
CREATE TABLE cbam_emissions_data (direct, indirect, method...)
CREATE TABLE cbam_default_values (sector, country, factor...)
CREATE TABLE cbam_reports (quarter, year, status...)
```

#### 1.2 Migration des Données Mockées
- Import des produits existants en base
- Conversion des données de test
- Configuration des facteurs d'émission officiels

#### 1.3 Intégration Authentification
- Protection des routes CBAM
- Association user_id aux données
- Politiques RLS Supabase

### Phase 2: Conformité Réglementaire (Semaine 2-3)
**Objectif**: Implémenter les calculs conformes au règlement

#### 2.1 Calculs CBAM Conformes
- Formules officielles par secteur
- Distinction ACTUAL/DEFAULT/HYBRID
- Émissions directes/indirectes séparées
- Validation des données d'entrée

#### 2.2 Export Template UE
- Format Excel conforme commission européenne
- Colonnes obligatoires et optionnelles
- Validation avant export
- Mapping des codes sectoriels

#### 2.3 Gestion des Phases
- Feature flag phase transitoire/opérationnelle
- Logique métier adaptée par phase
- Interface utilisateur contextuelle

### Phase 3: Phase Transitoire Complète (Semaine 3-4)
**Objectif**: Couvrir tous les besoins 2023-2025

#### 3.1 Reporting Trimestriel
- Calendrier automatique Q1-Q4
- Agrégation par période et secteur
- Statuts draft/submitted/corrected
- Historique des corrections

#### 3.2 Secteurs Complets CBAM
- Ciment: toutes sous-catégories
- Fer/Acier: produits dérivés
- Aluminium: primaire/secondaire
- Engrais: azotés/phosphatés
- Électricité: imports directs
- Hydrogène: + précurseurs

#### 3.3 Données de Référence
- Facteurs par défaut officiels UE
- Codes CN8 complets par secteur
- Pays et mécanismes carbone équivalents
- Taux de change ECB (API)

### Phase 4: Phase Opérationnelle 2026+ (Semaine 4-5)
**Objectif**: Préparer les obligations financières

#### 4.1 Calcul Obligation CBAM
```
Obligation = Émissions_incorporées × Prix_EU_ETS - Prix_carbone_origine
```
- Intégration prix EU ETS (front-month)
- Calcul prix carbone payé à l'origine
- Conversion devises avec taux ECB
- Proratisation par lot/produit

#### 4.2 Gestion Certificats CBAM
- Achat de certificats (simulation)
- Solde et journal des opérations
- Surrender des certificats
- Alertes de solde insuffisant

#### 4.3 Audit Trail Complet
- Traçabilité de toutes les modifications
- Logs d'accès et d'opérations
- Historique des calculs
- Conformité RGPD

### Phase 5: Optimisation & Production (Semaine 5-6)
**Objectif**: Performances, sécurité, ergonomie

#### 5.1 Performance & Scalabilité
- Indexation base de données
- Pagination des listes importantes
- Cache des calculs complexes
- Jobs asynchrones pour gros imports

#### 5.2 Sécurité Renforcée
- Chiffrement des données sensibles
- Audit logging structuré
- Contrôles d'accès granulaires
- Tests de sécurité automatisés

#### 5.3 UX/UI Avancée
- Import Excel avec validation en temps réel
- Wizard guidé pour nouveaux utilisateurs
- Dashboard avec KPIs métier
- Notifications automatiques

## 🧪 Stratégie de Tests

### Tests Unitaires (≥85% couverture)
- Calculs d'émissions par secteur
- Formules d'obligation CBAM 2026+
- Validations de données d'entrée
- Conversions de devises et unités

### Tests d'Intégration  
- Flux complet: import → calcul → export
- Authentification et autorisations
- Synchronisation avec APIs externes
- Migrations de données

### Tests End-to-End
- Scénarios utilisateur complets
- Reporting trimestriel de bout en bout
- Import/export de gros volumes
- Compatibilité navigateurs

### Jeux de Données de Test
```javascript
// Exemple validation calcul
const testCase = {
  product: "Aluminium primaire",
  volume: 10, // tonnes
  actualEmissions: { direct: 1.6, indirect: 2.5 }, // tCO2e/t
  expectedTotal: 41, // tCO2e
  euEtsPrice: 80, // €/t
  originPrice: 20, // €/t (avec preuve)
  expectedObligation: 2460 // € (41 × (80-20))
};
```

## 📚 Documentation à Produire

### Technique
- **CBAM_API.md**: Contrats d'API REST détaillés
- **CBAM_DATABASE.md**: Schéma et relations de données
- **CBAM_MIGRATION.md**: Scripts et procédures de migration
- **CBAM_DEPLOYMENT.md**: Guide de déploiement et configuration

### Fonctionnelle  
- **CBAM_USER_GUIDE.md**: Guide utilisateur complet avec captures d'écran
- **CBAM_IMPORTS.md**: Templates et validations pour imports Excel/CSV
- **CBAM_CALCULATIONS.md**: Documentation des formules et méthodes
- **CBAM_COMPLIANCE.md**: Mapping avec obligations réglementaires

### Conformité
- **CBAM_AUDIT.md**: Procédures d'audit et de contrôle
- **CBAM_SECURITY.md**: Mesures de sécurité et protection des données
- **CBAM_BACKUP.md**: Stratégies de sauvegarde et de récupération

## 🚀 Prochaines Étapes Immédiates

### 1. Validation du Plan (J+1)
- Review avec équipe technique
- Validation priorités métier
- Estimation des charges détaillées

### 2. Setup Environnement (J+2)
- Branches Git pour chaque phase
- Configuration Supabase CBAM
- Outils de test et CI/CD

### 3. Phase 1 - Sprint 1 (J+3 à J+10)
- Implémentation schéma DB complet
- Migration composants vers Supabase
- Tests unitaires des modèles de données

---

**Prochaine action recommandée**: Commencer par la Phase 1.1 (Schéma de Base de Données) pour établir les fondations solides du module CBAM.

*Dernière mise à jour: $(date)*