# GitHub Copilot Agent Examples

Real-world examples of using the Unreal Engine agent for common development tasks.

## Table of Contents

1. [Actor Creation](#actor-creation)
2. [Component Development](#component-development)
3. [Blueprint Integration](#blueprint-integration)
4. [Gameplay Systems](#gameplay-systems)
5. [Networking](#networking)
6. [Performance Optimization](#performance-optimization)
7. [Project Analysis](#project-analysis)
8. [Knowledge Queries](#knowledge-queries)

---

## Actor Creation

### Example 1: Simple Pickup Actor

**User Query:**
```
@unreal_engine Create a simple pickup actor that can be collected by players. It should play a sound when collected and then destroy itself.
```

**Agent Response:**
```cpp
// PickupActor.h
#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "PickupActor.generated.h"

UCLASS(Blueprintable)
class YOURGAME_API APickupActor : public AActor
{
    GENERATED_BODY()
    
public:
    APickupActor();
    
protected:
    virtual void BeginPlay() override;
    
    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Pickup")
    TObjectPtr<UStaticMeshComponent> MeshComponent;
    
    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Pickup")
    TObjectPtr<USphereComponent> CollisionComponent;
    
    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Pickup|Audio")
    TObjectPtr<USoundBase> PickupSound;
    
    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Pickup")
    int32 PointValue = 10;
    
    UFUNCTION()
    void OnOverlapBegin(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor, 
                       UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, 
                       bool bFromSweep, const FHitResult& SweepResult);
    
    UFUNCTION(BlueprintImplementableEvent, Category = "Pickup")
    void OnPickedUp(AActor* Collector);
    
private:
    bool bWasCollected = false;
};
```

```cpp
// PickupActor.cpp
#include "PickupActor.h"
#include "Components/StaticMeshComponent.h"
#include "Components/SphereComponent.h"
#include "Kismet/GameplayStatics.h"

APickupActor::APickupActor()
{
    PrimaryActorTick.bCanEverTick = false;
    
    // Create collision component
    CollisionComponent = CreateDefaultSubobject<USphereComponent>(TEXT("CollisionComponent"));
    SetRootComponent(CollisionComponent);
    CollisionComponent->InitSphereRadius(50.0f);
    CollisionComponent->SetCollisionProfileName(TEXT("OverlapAllDynamic"));
    
    // Create mesh component
    MeshComponent = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("MeshComponent"));
    MeshComponent->SetupAttachment(CollisionComponent);
    MeshComponent->SetCollisionEnabled(ECollisionEnabled::NoCollision);
}

void APickupActor::BeginPlay()
{
    Super::BeginPlay();
    
    CollisionComponent->OnComponentBeginOverlap.AddDynamic(this, &APickupActor::OnOverlapBegin);
}

void APickupActor::OnOverlapBegin(UPrimitiveComponent* OverlappedComponent, AActor* OtherActor, 
                                  UPrimitiveComponent* OtherComp, int32 OtherBodyIndex, 
                                  bool bFromSweep, const FHitResult& SweepResult)
{
    if (bWasCollected || !OtherActor)
    {
        return;
    }
    
    // Check if the overlapping actor is a player character
    if (OtherActor->IsA(APawn::StaticClass()))
    {
        bWasCollected = true;
        
        // Play pickup sound
        if (PickupSound)
        {
            UGameplayStatics::PlaySoundAtLocation(this, PickupSound, GetActorLocation());
        }
        
        // Call Blueprint event
        OnPickedUp(OtherActor);
        
        // Destroy after a short delay to let sound play
        SetLifeSpan(0.5f);
    }
}
```

---

## Component Development

### Example 2: Health Component with Replication

**User Query:**
```
@unreal_engine Create a health component with replication support for multiplayer. Include damage handling, healing, death events, and Blueprint-callable functions.
```

**Agent Response:**
```cpp
// HealthComponent.h
#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "Net/UnrealNetwork.h"
#include "HealthComponent.generated.h"

DECLARE_DYNAMIC_MULTICAST_DELEGATE_ThreeParams(FOnHealthChanged, float, CurrentHealth, float, MaxHealth, float, DamageAmount);
DECLARE_DYNAMIC_MULTICAST_DELEGATE_OneParam(FOnDeath, AActor*, Killer);

UCLASS(ClassGroup=(Custom), meta=(BlueprintSpawnableComponent))
class YOURGAME_API UHealthComponent : public UActorComponent
{
    GENERATED_BODY()

public:
    UHealthComponent();
    
    virtual void GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const override;
    
    // Events
    UPROPERTY(BlueprintAssignable, Category = "Health")
    FOnHealthChanged OnHealthChanged;
    
    UPROPERTY(BlueprintAssignable, Category = "Health")
    FOnDeath OnDeath;
    
    // Functions
    UFUNCTION(BlueprintCallable, Category = "Health")
    void ApplyDamage(float DamageAmount, AActor* DamageCauser);
    
    UFUNCTION(BlueprintCallable, Category = "Health")
    void Heal(float HealAmount);
    
    UFUNCTION(BlueprintPure, Category = "Health")
    float GetHealth() const { return CurrentHealth; }
    
    UFUNCTION(BlueprintPure, Category = "Health")
    float GetMaxHealth() const { return MaxHealth; }
    
    UFUNCTION(BlueprintPure, Category = "Health")
    float GetHealthPercentage() const { return CurrentHealth / MaxHealth; }
    
    UFUNCTION(BlueprintPure, Category = "Health")
    bool IsDead() const { return bIsDead; }
    
protected:
    virtual void BeginPlay() override;
    
    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Health", Replicated)
    float MaxHealth = 100.0f;
    
    UPROPERTY(BlueprintReadOnly, Category = "Health", ReplicatedUsing = OnRep_CurrentHealth)
    float CurrentHealth;
    
    UPROPERTY(BlueprintReadOnly, Category = "Health", Replicated)
    bool bIsDead = false;
    
    UFUNCTION()
    void OnRep_CurrentHealth(float OldHealth);
    
private:
    void HandleDeath(AActor* Killer);
};
```

```cpp
// HealthComponent.cpp
#include "HealthComponent.h"

UHealthComponent::UHealthComponent()
{
    PrimaryComponentTick.bCanEverTick = false;
    SetIsReplicatedByDefault(true);
    CurrentHealth = MaxHealth;
}

void UHealthComponent::GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const
{
    Super::GetLifetimeReplicatedProps(OutLifetimeProps);
    
    DOREPLIFETIME(UHealthComponent, CurrentHealth);
    DOREPLIFETIME(UHealthComponent, MaxHealth);
    DOREPLIFETIME(UHealthComponent, bIsDead);
}

void UHealthComponent::BeginPlay()
{
    Super::BeginPlay();
    CurrentHealth = MaxHealth;
}

void UHealthComponent::ApplyDamage(float DamageAmount, AActor* DamageCauser)
{
    if (bIsDead || DamageAmount <= 0.0f)
    {
        return;
    }
    
    // Only apply damage on server
    if (GetOwner()->HasAuthority())
    {
        const float OldHealth = CurrentHealth;
        CurrentHealth = FMath::Max(0.0f, CurrentHealth - DamageAmount);
        
        OnHealthChanged.Broadcast(CurrentHealth, MaxHealth, DamageAmount);
        
        if (CurrentHealth <= 0.0f && !bIsDead)
        {
            HandleDeath(DamageCauser);
        }
    }
}

void UHealthComponent::Heal(float HealAmount)
{
    if (bIsDead || HealAmount <= 0.0f)
    {
        return;
    }
    
    if (GetOwner()->HasAuthority())
    {
        CurrentHealth = FMath::Min(MaxHealth, CurrentHealth + HealAmount);
        OnHealthChanged.Broadcast(CurrentHealth, MaxHealth, -HealAmount);
    }
}

void UHealthComponent::OnRep_CurrentHealth(float OldHealth)
{
    const float DamageAmount = OldHealth - CurrentHealth;
    OnHealthChanged.Broadcast(CurrentHealth, MaxHealth, DamageAmount);
}

void UHealthComponent::HandleDeath(AActor* Killer)
{
    bIsDead = true;
    OnDeath.Broadcast(Killer);
}
```

---

## Blueprint Integration

### Example 3: Making C++ Functions Blueprint-Callable

**User Query:**
```
@unreal_engine I have these C++ functions. Make them callable from Blueprints:
void PerformAttack(int32 AttackType);
bool CanAttack() const;
void OnAttackComplete();
```

**Agent Response:**
```cpp
// In your actor header file:

UFUNCTION(BlueprintCallable, Category = "Combat")
void PerformAttack(int32 AttackType);

UFUNCTION(BlueprintPure, Category = "Combat")
bool CanAttack() const;

UFUNCTION(BlueprintImplementableEvent, Category = "Combat")
void OnAttackComplete();

// Additional improvements for Blueprint exposure:

// If you want Blueprints to override the attack completion behavior:
UFUNCTION(BlueprintNativeEvent, Category = "Combat")
void OnAttackComplete();
virtual void OnAttackComplete_Implementation();

// To expose the attack result to Blueprints:
UFUNCTION(BlueprintCallable, Category = "Combat", meta = (ExpandEnumAsExecs = "ReturnValue"))
EAttackResult PerformAttackWithResult(int32 AttackType);
```

**Explanation:**
- Use `BlueprintCallable` for functions that modify state
- Use `BlueprintPure` for const functions (getters)
- Use `BlueprintImplementableEvent` for events Blueprints can implement
- Use `BlueprintNativeEvent` for events with C++ default implementation
- Always include a `Category` for organization in Blueprint graphs

---

## Gameplay Systems

### Example 4: Gameplay Ability System Integration

**User Query:**
```
@unreal_engine Set up a character to use Gameplay Ability System with a simple attack ability
```

**Agent Response:**
```cpp
// MyCharacter.h
#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "AbilitySystemInterface.h"
#include "AbilitySystemComponent.h"
#include "AttributeSet.h"
#include "MyCharacter.generated.h"

UCLASS()
class YOURGAME_API AMyCharacter : public ACharacter, public IAbilitySystemInterface
{
    GENERATED_BODY()

public:
    AMyCharacter();
    
    // IAbilitySystemInterface
    virtual UAbilitySystemComponent* GetAbilitySystemComponent() const override;
    
    virtual void PossessedBy(AController* NewController) override;
    virtual void OnRep_PlayerState() override;
    
protected:
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "GAS")
    TObjectPtr<UAbilitySystemComponent> AbilitySystemComponent;
    
    UPROPERTY()
    TObjectPtr<UAttributeSet> AttributeSet;
    
    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "GAS|Abilities")
    TArray<TSubclassOf<UGameplayAbility>> StartingAbilities;
    
    UPROPERTY(EditDefaultsOnly, BlueprintReadOnly, Category = "GAS|Effects")
    TArray<TSubclassOf<UGameplayEffect>> StartingEffects;
    
    void InitializeAbilitySystem();
    void GrantStartingAbilitiesAndEffects();
};
```

See [full GAS implementation example](https://docs.unrealengine.com/5.6/en-US/gameplay-ability-system-for-unreal-engine/) in Unreal Documentation.

---

## Networking

### Example 5: Replicated Actor with RPCs

**User Query:**
```
@unreal_engine Create a replicated door actor that can be opened by any client but is controlled by the server
```

**Agent Response:**
```cpp
// DoorActor.h
#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "DoorActor.generated.h"

UENUM(BlueprintType)
enum class EDoorState : uint8
{
    Closed,
    Opening,
    Open,
    Closing
};

UCLASS()
class YOURGAME_API ADoorActor : public AActor
{
    GENERATED_BODY()

public:
    ADoorActor();
    
    virtual void GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const override;
    virtual void Tick(float DeltaTime) override;
    
    UFUNCTION(BlueprintCallable, Category = "Door")
    void ToggleDoor();
    
protected:
    virtual void BeginPlay() override;
    
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
    TObjectPtr<UStaticMeshComponent> DoorMesh;
    
    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Door")
    float OpenAngle = 90.0f;
    
    UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = "Door")
    float OpenSpeed = 2.0f;
    
    UPROPERTY(ReplicatedUsing = OnRep_DoorState)
    EDoorState DoorState;
    
    UFUNCTION()
    void OnRep_DoorState();
    
    UFUNCTION(Server, Reliable, WithValidation)
    void ServerToggleDoor();
    void ServerToggleDoor_Implementation();
    bool ServerToggleDoor_Validate();
    
private:
    float CurrentYaw = 0.0f;
    float TargetYaw = 0.0f;
    
    void UpdateDoorRotation(float DeltaTime);
};
```

This example demonstrates proper networking patterns including replication, RPCs, and validation.

---

## Performance Optimization

### Example 6: Optimizing Tick-Heavy Actor

**User Query:**
```
@unreal_engine This actor is causing performance issues. How can I optimize it?

[Code shows actor ticking every frame to check distance to player]
```

**Agent Response:**
The issue is unnecessary tick usage. Here are several optimization strategies:

```cpp
// BEFORE (Inefficient):
void AMyActor::Tick(float DeltaTime)
{
    Super::Tick(DeltaTime);
    
    APlayerController* PC = UGameplayStatics::GetPlayerController(this, 0);
    if (PC && PC->GetPawn())
    {
        float Distance = FVector::Dist(GetActorLocation(), PC->GetPawn()->GetActorLocation());
        if (Distance < ActivationRange)
        {
            Activate();
        }
    }
}

// AFTER (Optimized):
void AMyActor::BeginPlay()
{
    Super::BeginPlay();
    
    // Disable tick entirely
    PrimaryActorTick.bCanEverTick = false;
    
    // Use timer instead - check every 0.5 seconds
    GetWorldTimerManager().SetTimer(
        DistanceCheckTimerHandle,
        this,
        &AMyActor::CheckPlayerDistance,
        0.5f,
        true
    );
}

void AMyActor::CheckPlayerDistance()
{
    if (APlayerController* PC = UGameplayStatics::GetPlayerController(this, 0))
    {
        if (APawn* PlayerPawn = PC->GetPawn())
        {
            const float DistanceSquared = FVector::DistSquared(GetActorLocation(), PlayerPawn->GetActorLocation());
            const float ActivationRangeSquared = ActivationRange * ActivationRange;
            
            if (DistanceSquared < ActivationRangeSquared)
            {
                Activate();
                // Stop checking once activated
                GetWorldTimerManager().ClearTimer(DistanceCheckTimerHandle);
            }
        }
    }
}
```

**Key Optimizations:**
1. Disabled tick completely
2. Use timer with 0.5s interval instead of every frame
3. Cache player pawn reference when possible
4. Use DistSquared instead of Dist (avoids sqrt)
5. Stop timer once activated

---

## Project Analysis

### Example 7: Using MCP Tools for Project Understanding

**User Query:**
```
@unreal_engine Analyze my project and tell me about the character classes
```

**Agent Response (with Adastrea-MCP):**
```
I'll scan your project structure first...

[Agent uses: scan_unreal_project]
[Agent uses: search_code with query "Character"]

Based on the project scan, I found:

**Character Classes:**
1. `APlayerCharacter` - Your main player character
   - Inherits from: ACharacter
   - Location: Source/YourGame/Public/Characters/PlayerCharacter.h
   - Key features:
     - Health component
     - Sprint ability
     - Weapon system

2. `AEnemyCharacter` - Base enemy class
   - Inherits from: ACharacter
   - Location: Source/YourGame/Public/Characters/EnemyCharacter.h
   - Replicated for multiplayer
   
3. `ABossCharacter` - Boss enemy type
   - Inherits from: AEnemyCharacter
   - Has additional phases system

Would you like me to analyze any specific character class in detail?
```

---

## Knowledge Queries

### Example 8: Learning About Engine Features

**User Query:**
```
@unreal_engine How do I implement Lumen global illumination in my level?
```

**Agent Response:**
```
Lumen is Unreal Engine 5's dynamic global illumination system. Here's how to implement it:

**1. Enable Lumen in Project Settings:**
- Edit > Project Settings > Engine > Rendering
- Set "Dynamic Global Illumination Method" to "Lumen"
- Set "Reflection Method" to "Lumen"

**2. Configure Post Process Volume:**
```cpp
// In C++ or Blueprint
PostProcessVolume->Settings.DynamicGlobalIlluminationMethod = EDynamicGlobalIlluminationMethod::Lumen;
PostProcessVolume->Settings.ReflectionMethod = EReflectionMethod::Lumen;

// Quality settings
PostProcessVolume->Settings.LumenSceneLightingQuality = 1.0f;
PostProcessVolume->Settings.LumenSceneDetail = 1.0f;
```

**3. Console Commands for Testing:**
```
r.Lumen.DiffuseIndirect.Enable 1
r.Lumen.Reflections.Enable 1
stat Lumen  (show Lumen stats)
```

**Best Practices:**
- Use Nanite meshes for best Lumen performance
- Ensure proper lighting setup with directional light
- Use Lumen Scene quality settings to balance performance
- Enable "Affect Distance Field Lighting" on static meshes

For more details, query the knowledge database:
```
query_ue_knowledge "Lumen rendering"
```
```

---

## Summary

These examples demonstrate:
- ✅ Proper Epic Games coding standards
- ✅ Blueprint integration best practices
- ✅ Networking and replication patterns
- ✅ Performance optimization techniques
- ✅ MCP tool integration for project analysis
- ✅ Knowledge database queries

For more examples and detailed guidance, see:
- [Main Documentation](.github/agents/README.md)
- [Unreal Engine Docs](https://docs.unrealengine.com/)
- [Epic Games Coding Standards](https://docs.unrealengine.com/en-US/epic-cplusplus-coding-standard/)
