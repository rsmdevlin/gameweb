#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "PropHuntCharacter.generated.h"

class USpringArmComponent;
class UCameraComponent;
class UInputMappingContext;
class UInputAction;
struct FInputActionValue;

UENUM(BlueprintType)
enum class ECharacterState : uint8
{
	Normal UMETA(DisplayName = "Normal"),
	Prop UMETA(DisplayName = "Prop"),
	Dead UMETA(DisplayName = "Dead")
};

UCLASS()
class PROPHUNTGAME_API APropHuntCharacter : public ACharacter
{
	GENERATED_BODY()

public:
	APropHuntCharacter();

	virtual void GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const override;
	virtual void Tick(float DeltaTime) override;
	virtual void SetupPlayerInputComponent(class UInputComponent* PlayerInputComponent) override;

	// Camera components
	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = Camera)
	USpringArmComponent* CameraBoom;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = Camera)
	UCameraComponent* FollowCamera;

	// Input Actions
	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = Input)
	UInputMappingContext* DefaultMappingContext;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = Input)
	UInputAction* MoveAction;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = Input)
	UInputAction* LookAction;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = Input)
	UInputAction* JumpAction;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = Input)
	UInputAction* SprintAction;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = Input)
	UInputAction* AttackAction;

	UPROPERTY(EditAnywhere, BlueprintReadOnly, Category = Input)
	UInputAction* TransformAction;

	// Character state
	UPROPERTY(Replicated, BlueprintReadOnly, Category = "Character")
	ECharacterState CharacterState;

	UPROPERTY(Replicated, BlueprintReadOnly, Category = "Character")
	float Health;

	UPROPERTY(Replicated, BlueprintReadOnly, Category = "Character")
	float MaxHealth;

	UPROPERTY(Replicated, BlueprintReadOnly, Category = "Character")
	bool bIsSprinting;

	// Movement properties
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Movement")
	float WalkSpeed;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Movement")
	float SprintSpeed;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Movement")
	float PropSpeed;

	// Gameplay functions
	UFUNCTION(BlueprintCallable, Category = "Character")
	void TakeDamageAmount(float Damage, AActor* DamageCauser);

	UFUNCTION(BlueprintCallable, Category = "Character")
	void Die();

	UFUNCTION(BlueprintCallable, Category = "Character")
	bool IsAlive() const { return CharacterState != ECharacterState::Dead && Health > 0.f; }

	UFUNCTION(BlueprintCallable, Category = "Character")
	void SetCharacterState(ECharacterState NewState);

	// Server RPCs
	UFUNCTION(Server, Reliable, WithValidation)
	void ServerSetSprinting(bool bSprinting);

	UFUNCTION(Server, Reliable, WithValidation)
	void ServerAttack();

	UFUNCTION(Server, Reliable, WithValidation)
	void ServerTransform(int32 PropIndex);

	// Multicast RPCs
	UFUNCTION(NetMulticast, Reliable)
	void MulticastDie();

	UFUNCTION(NetMulticast, Reliable)
	void MulticastTransform(int32 PropIndex);

protected:
	virtual void BeginPlay() override;

	// Input handlers
	void Move(const FInputActionValue& Value);
	void Look(const FInputActionValue& Value);
	void StartSprint();
	void StopSprint();
	void Attack();
	void Transform();

	// Camera smoothing
	void UpdateCamera(float DeltaTime);
	FVector LastCameraLocation;
	float CameraLagSpeed;

private:
	void UpdateMovementSpeed();
};
