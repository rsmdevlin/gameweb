#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "HunterWeapon.generated.h"

UCLASS()
class PROPHUNTGAME_API AHunterWeapon : public AActor
{
	GENERATED_BODY()

public:
	AHunterWeapon();

	virtual void GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const override;
	virtual void Tick(float DeltaTime) override;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
	USkeletalMeshComponent* WeaponMesh;

	// Weapon properties
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
	float Damage;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
	float FireRate;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
	float Range;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
	float Spread;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
	int32 MaxAmmo;

	UPROPERTY(Replicated, BlueprintReadOnly, Category = "Weapon")
	int32 CurrentAmmo;

	UPROPERTY(Replicated, BlueprintReadOnly, Category = "Weapon")
	bool bIsReloading;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Weapon")
	float ReloadTime;

	// Fire weapon
	UFUNCTION(BlueprintCallable, Category = "Weapon")
	void Fire();

	UFUNCTION(BlueprintCallable, Category = "Weapon")
	void Reload();

	UFUNCTION(BlueprintCallable, Category = "Weapon")
	bool CanFire() const;

	// Server RPCs
	UFUNCTION(Server, Reliable, WithValidation)
	void ServerFire(FVector CameraLocation, FRotator CameraRotation);

	UFUNCTION(Server, Reliable, WithValidation)
	void ServerReload();

	// Multicast RPCs
	UFUNCTION(NetMulticast, Reliable)
	void MulticastPlayFireEffects();

	UFUNCTION(NetMulticast, Reliable)
	void MulticastPlayHitEffect(FVector ImpactPoint, FVector ImpactNormal);

protected:
	virtual void BeginPlay() override;

	FTimerHandle FireRateTimer;
	FTimerHandle ReloadTimer;

	bool bCanFire;

	void ProcessHit(const FHitResult& Hit);
	void ResetFireRate();
	void FinishReload();
};
