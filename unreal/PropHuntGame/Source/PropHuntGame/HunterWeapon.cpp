#include "HunterWeapon.h"
#include "PropHuntCharacter.h"
#include "PropHuntGameMode.h"
#include "DrawDebugHelpers.h"
#include "Kismet/GameplayStatics.h"
#include "Net/UnrealNetwork.h"

AHunterWeapon::AHunterWeapon()
{
	PrimaryActorTick.bCanEverTick = true;

	WeaponMesh = CreateDefaultSubobject<USkeletalMeshComponent>(TEXT("WeaponMesh"));
	RootComponent = WeaponMesh;

	// Default values
	Damage = 25.f;
	FireRate = 0.5f; // 2 shots per second
	Range = 5000.f;
	Spread = 2.f;
	MaxAmmo = 30;
	CurrentAmmo = MaxAmmo;
	ReloadTime = 2.f;
	bIsReloading = false;
	bCanFire = true;

	// Enable replication
	bReplicates = true;
}

void AHunterWeapon::GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const
{
	Super::GetLifetimeReplicatedProps(OutLifetimeProps);

	DOREPLIFETIME(AHunterWeapon, CurrentAmmo);
	DOREPLIFETIME(AHunterWeapon, bIsReloading);
}

void AHunterWeapon::BeginPlay()
{
	Super::BeginPlay();
}

void AHunterWeapon::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);
}

bool AHunterWeapon::CanFire() const
{
	return bCanFire && !bIsReloading && CurrentAmmo > 0;
}

void AHunterWeapon::Fire()
{
	if (!CanFire())
	{
		return;
	}

	// Get camera location and rotation for accuracy
	APawn* OwnerPawn = Cast<APawn>(GetOwner());
	if (!OwnerPawn)
	{
		return;
	}

	APlayerController* PC = Cast<APlayerController>(OwnerPawn->GetController());
	if (!PC)
	{
		return;
	}

	FVector CameraLocation;
	FRotator CameraRotation;
	PC->GetPlayerViewPoint(CameraLocation, CameraRotation);

	ServerFire(CameraLocation, CameraRotation);
}

void AHunterWeapon::ServerFire_Implementation(FVector CameraLocation, FRotator CameraRotation)
{
	if (!CanFire())
	{
		return;
	}

	// Consume ammo
	CurrentAmmo--;
	bCanFire = false;

	// Set fire rate cooldown
	GetWorld()->GetTimerManager().SetTimer(FireRateTimer, this, &AHunterWeapon::ResetFireRate, FireRate, false);

	// Add spread
	FVector Direction = CameraRotation.Vector();
	float SpreadRadians = FMath::DegreesToRadians(Spread);
	Direction.X += FMath::RandRange(-SpreadRadians, SpreadRadians);
	Direction.Y += FMath::RandRange(-SpreadRadians, SpreadRadians);
	Direction.Normalize();

	FVector EndLocation = CameraLocation + (Direction * Range);

	// Perform line trace
	FHitResult Hit;
	FCollisionQueryParams QueryParams;
	QueryParams.AddIgnoredActor(this);
	QueryParams.AddIgnoredActor(GetOwner());
	QueryParams.bTraceComplex = true;

	bool bHit = GetWorld()->LineTraceSingleByChannel(
		Hit,
		CameraLocation,
		EndLocation,
		ECC_Visibility,
		QueryParams
	);

	// Debug line
	//DrawDebugLine(GetWorld(), CameraLocation, bHit ? Hit.ImpactPoint : EndLocation, FColor::Red, false, 2.f);

	if (bHit)
	{
		ProcessHit(Hit);
		MulticastPlayHitEffect(Hit.ImpactPoint, Hit.ImpactNormal);
	}

	// Play fire effects
	MulticastPlayFireEffects();

	// Auto-reload when empty
	if (CurrentAmmo == 0)
	{
		Reload();
	}
}

bool AHunterWeapon::ServerFire_Validate(FVector CameraLocation, FRotator CameraRotation)
{
	return true;
}

void AHunterWeapon::ProcessHit(const FHitResult& Hit)
{
	AActor* HitActor = Hit.GetActor();
	if (!HitActor)
	{
		return;
	}

	// Check if hit a character
	APropHuntCharacter* HitCharacter = Cast<APropHuntCharacter>(HitActor);
	if (HitCharacter && HitCharacter->IsAlive())
	{
		// Apply damage
		HitCharacter->TakeDamageAmount(Damage, GetOwner());

		UE_LOG(LogTemp, Log, TEXT("Hit character %s for %.0f damage"), *HitCharacter->GetName(), Damage);

		// Notify game mode of potential kill
		if (!HitCharacter->IsAlive())
		{
			APropHuntGameMode* GM = Cast<APropHuntGameMode>(GetWorld()->GetAuthGameMode());
			if (GM)
			{
				APawn* OwnerPawn = Cast<APawn>(GetOwner());
				if (OwnerPawn)
				{
					GM->OnPlayerDied(OwnerPawn->GetController(), HitCharacter->GetController());
				}
			}
		}
	}
	else
	{
		// Hit non-player object - could add penalty for shooting decorations
		UE_LOG(LogTemp, Log, TEXT("Hit object: %s"), *HitActor->GetName());
	}
}

void AHunterWeapon::Reload()
{
	if (bIsReloading || CurrentAmmo == MaxAmmo)
	{
		return;
	}

	ServerReload();
}

void AHunterWeapon::ServerReload_Implementation()
{
	if (bIsReloading)
	{
		return;
	}

	bIsReloading = true;
	GetWorld()->GetTimerManager().SetTimer(ReloadTimer, this, &AHunterWeapon::FinishReload, ReloadTime, false);

	UE_LOG(LogTemp, Log, TEXT("Reloading weapon..."));
}

bool AHunterWeapon::ServerReload_Validate()
{
	return true;
}

void AHunterWeapon::FinishReload()
{
	CurrentAmmo = MaxAmmo;
	bIsReloading = false;

	UE_LOG(LogTemp, Log, TEXT("Reload complete"));
}

void AHunterWeapon::ResetFireRate()
{
	bCanFire = true;
}

void AHunterWeapon::MulticastPlayFireEffects_Implementation()
{
	// Play muzzle flash, sound, etc.
	// Will be implemented with actual effects in UE Editor

	UE_LOG(LogTemp, Log, TEXT("Fire effects played"));
}

void AHunterWeapon::MulticastPlayHitEffect_Implementation(FVector ImpactPoint, FVector ImpactNormal)
{
	// Spawn hit particle effect, decal, etc.
	// Will be implemented with actual effects in UE Editor

	UE_LOG(LogTemp, Log, TEXT("Hit effect at location: %s"), *ImpactPoint.ToString());
}
