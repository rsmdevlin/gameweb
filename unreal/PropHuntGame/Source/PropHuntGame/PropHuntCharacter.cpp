#include "PropHuntCharacter.h"
#include "Camera/CameraComponent.h"
#include "GameFramework/SpringArmComponent.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "EnhancedInputComponent.h"
#include "EnhancedInputSubsystems.h"
#include "Net/UnrealNetwork.h"
#include "Engine/Engine.h"

APropHuntCharacter::APropHuntCharacter()
{
	PrimaryActorTick.bCanEverTick = true;

	// Set default values
	CharacterState = ECharacterState::Normal;
	Health = 100.f;
	MaxHealth = 100.f;
	bIsSprinting = false;
	WalkSpeed = 600.f;
	SprintSpeed = 900.f;
	PropSpeed = 400.f;
	CameraLagSpeed = 10.f;

	// Don't rotate character with controller
	bUseControllerRotationPitch = false;
	bUseControllerRotationYaw = false;
	bUseControllerRotationRoll = false;

	// Configure character movement
	GetCharacterMovement()->bOrientRotationToMovement = true;
	GetCharacterMovement()->RotationRate = FRotator(0.f, 500.f, 0.f);
	GetCharacterMovement()->JumpZVelocity = 700.f;
	GetCharacterMovement()->AirControl = 0.35f;
	GetCharacterMovement()->MaxWalkSpeed = WalkSpeed;
	GetCharacterMovement()->MinAnalogWalkSpeed = 20.f;
	GetCharacterMovement()->BrakingDecelerationWalking = 2000.f;

	// Create camera boom
	CameraBoom = CreateDefaultSubobject<USpringArmComponent>(TEXT("CameraBoom"));
	CameraBoom->SetupAttachment(RootComponent);
	CameraBoom->TargetArmLength = 400.f;
	CameraBoom->bUsePawnControlRotation = true;
	CameraBoom->bEnableCameraLag = true;
	CameraBoom->CameraLagSpeed = 3.f;
	CameraBoom->bDoCollisionTest = true;

	// Create follow camera
	FollowCamera = CreateDefaultSubobject<UCameraComponent>(TEXT("FollowCamera"));
	FollowCamera->SetupAttachment(CameraBoom, USpringArmComponent::SocketName);
	FollowCamera->bUsePawnControlRotation = false;

	// Enable replication
	bReplicates = true;
	SetReplicateMovement(true);
}

void APropHuntCharacter::GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const
{
	Super::GetLifetimeReplicatedProps(OutLifetimeProps);

	DOREPLIFETIME(APropHuntCharacter, CharacterState);
	DOREPLIFETIME(APropHuntCharacter, Health);
	DOREPLIFETIME(APropHuntCharacter, MaxHealth);
	DOREPLIFETIME(APropHuntCharacter, bIsSprinting);
}

void APropHuntCharacter::BeginPlay()
{
	Super::BeginPlay();

	// Add Input Mapping Context
	if (APlayerController* PlayerController = Cast<APlayerController>(Controller))
	{
		if (UEnhancedInputLocalPlayerSubsystem* Subsystem =
			ULocalPlayer::GetSubsystem<UEnhancedInputLocalPlayerSubsystem>(PlayerController->GetLocalPlayer()))
		{
			if (DefaultMappingContext)
			{
				Subsystem->AddMappingContext(DefaultMappingContext, 0);
			}
		}
	}

	LastCameraLocation = FollowCamera->GetComponentLocation();
}

void APropHuntCharacter::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);

	UpdateCamera(DeltaTime);
}

void APropHuntCharacter::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
	Super::SetupPlayerInputComponent(PlayerInputComponent);

	if (UEnhancedInputComponent* EnhancedInputComponent = CastChecked<UEnhancedInputComponent>(PlayerInputComponent))
	{
		// Moving
		if (MoveAction)
		{
			EnhancedInputComponent->BindAction(MoveAction, ETriggerEvent::Triggered, this, &APropHuntCharacter::Move);
		}

		// Looking
		if (LookAction)
		{
			EnhancedInputComponent->BindAction(LookAction, ETriggerEvent::Triggered, this, &APropHuntCharacter::Look);
		}

		// Jumping
		if (JumpAction)
		{
			EnhancedInputComponent->BindAction(JumpAction, ETriggerEvent::Started, this, &ACharacter::Jump);
			EnhancedInputComponent->BindAction(JumpAction, ETriggerEvent::Completed, this, &ACharacter::StopJumping);
		}

		// Sprinting
		if (SprintAction)
		{
			EnhancedInputComponent->BindAction(SprintAction, ETriggerEvent::Started, this, &APropHuntCharacter::StartSprint);
			EnhancedInputComponent->BindAction(SprintAction, ETriggerEvent::Completed, this, &APropHuntCharacter::StopSprint);
		}

		// Attack
		if (AttackAction)
		{
			EnhancedInputComponent->BindAction(AttackAction, ETriggerEvent::Started, this, &APropHuntCharacter::Attack);
		}

		// Transform
		if (TransformAction)
		{
			EnhancedInputComponent->BindAction(TransformAction, ETriggerEvent::Started, this, &APropHuntCharacter::Transform);
		}
	}
}

void APropHuntCharacter::Move(const FInputActionValue& Value)
{
	if (!IsAlive()) return;

	FVector2D MovementVector = Value.Get<FVector2D>();

	if (Controller != nullptr)
	{
		// Get forward/right direction
		const FRotator Rotation = Controller->GetControlRotation();
		const FRotator YawRotation(0, Rotation.Yaw, 0);

		const FVector ForwardDirection = FRotationMatrix(YawRotation).GetUnitAxis(EAxis::X);
		const FVector RightDirection = FRotationMatrix(YawRotation).GetUnitAxis(EAxis::Y);

		// Add movement
		AddMovementInput(ForwardDirection, MovementVector.Y);
		AddMovementInput(RightDirection, MovementVector.X);
	}
}

void APropHuntCharacter::Look(const FInputActionValue& Value)
{
	FVector2D LookAxisVector = Value.Get<FVector2D>();

	if (Controller != nullptr)
	{
		AddControllerYawInput(LookAxisVector.X);
		AddControllerPitchInput(LookAxisVector.Y);
	}
}

void APropHuntCharacter::StartSprint()
{
	if (!IsAlive() || CharacterState == ECharacterState::Prop) return;

	ServerSetSprinting(true);
}

void APropHuntCharacter::StopSprint()
{
	ServerSetSprinting(false);
}

void APropHuntCharacter::ServerSetSprinting_Implementation(bool bSprinting)
{
	bIsSprinting = bSprinting;
	UpdateMovementSpeed();
}

bool APropHuntCharacter::ServerSetSprinting_Validate(bool bSprinting)
{
	return true;
}

void APropHuntCharacter::Attack()
{
	if (!IsAlive()) return;

	ServerAttack();
}

void APropHuntCharacter::ServerAttack_Implementation()
{
	// Attack logic will be handled by weapon system
	// This is called from Hunter weapon
}

bool APropHuntCharacter::ServerAttack_Validate()
{
	return true;
}

void APropHuntCharacter::Transform()
{
	if (!IsAlive() || CharacterState == ECharacterState::Dead) return;

	// For now, toggle between Normal and Prop
	// In full implementation, this will show prop selection UI
	int32 PropIndex = (CharacterState == ECharacterState::Prop) ? -1 : 0;
	ServerTransform(PropIndex);
}

void APropHuntCharacter::ServerTransform_Implementation(int32 PropIndex)
{
	MulticastTransform(PropIndex);
}

bool APropHuntCharacter::ServerTransform_Validate(int32 PropIndex)
{
	return true;
}

void APropHuntCharacter::MulticastTransform_Implementation(int32 PropIndex)
{
	if (PropIndex < 0)
	{
		// Transform back to character
		SetCharacterState(ECharacterState::Normal);
		GetMesh()->SetVisibility(true);
	}
	else
	{
		// Transform to prop
		SetCharacterState(ECharacterState::Prop);
		// Hide character mesh (prop mesh will be spawned by PropComponent)
		GetMesh()->SetVisibility(false);
	}
}

void APropHuntCharacter::SetCharacterState(ECharacterState NewState)
{
	CharacterState = NewState;
	UpdateMovementSpeed();
}

void APropHuntCharacter::UpdateMovementSpeed()
{
	if (!GetCharacterMovement()) return;

	float NewMaxSpeed = WalkSpeed;

	switch (CharacterState)
	{
	case ECharacterState::Normal:
		NewMaxSpeed = bIsSprinting ? SprintSpeed : WalkSpeed;
		break;
	case ECharacterState::Prop:
		NewMaxSpeed = PropSpeed;
		break;
	case ECharacterState::Dead:
		NewMaxSpeed = 0.f;
		break;
	}

	GetCharacterMovement()->MaxWalkSpeed = NewMaxSpeed;
}

void APropHuntCharacter::TakeDamageAmount(float Damage, AActor* DamageCauser)
{
	if (!IsAlive() || !HasAuthority()) return;

	Health -= Damage;

	if (Health <= 0.f)
	{
		Health = 0.f;
		Die();
	}
}

void APropHuntCharacter::Die()
{
	if (!HasAuthority()) return;

	MulticastDie();
}

void APropHuntCharacter::MulticastDie_Implementation()
{
	CharacterState = ECharacterState::Dead;
	Health = 0.f;

	// Disable movement
	GetCharacterMovement()->DisableMovement();
	GetCharacterMovement()->StopMovementImmediately();

	// Disable collision
	GetCapsuleComponent()->SetCollisionEnabled(ECollisionEnabled::NoCollision);

	// Ragdoll physics
	if (GetMesh())
	{
		GetMesh()->SetSimulatePhysics(true);
		GetMesh()->SetCollisionEnabled(ECollisionEnabled::QueryAndPhysics);
	}

	// Disable input
	if (APlayerController* PC = Cast<APlayerController>(GetController()))
	{
		DisableInput(PC);
	}
}

void APropHuntCharacter::UpdateCamera(float DeltaTime)
{
	if (!FollowCamera) return;

	// Smooth camera movement
	FVector CurrentLocation = FollowCamera->GetComponentLocation();
	FVector SmoothedLocation = FMath::VInterpTo(LastCameraLocation, CurrentLocation, DeltaTime, CameraLagSpeed);
	LastCameraLocation = SmoothedLocation;
}
