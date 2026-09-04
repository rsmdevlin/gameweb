#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "PropActor.generated.h"

UCLASS()
class PROPHUNTGAME_API APropActor : public AActor
{
	GENERATED_BODY()

public:
	APropActor();

	virtual void GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const override;
	virtual void Tick(float DeltaTime) override;

	UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "Components")
	UStaticMeshComponent* PropMesh;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Prop")
	FString PropName;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Prop")
	int32 PropIndex;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Prop")
	float PropHealth;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Prop")
	float PropMaxHealth;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Prop")
	float PropMovementSpeed;

	UPROPERTY(Replicated, BlueprintReadOnly, Category = "Prop")
	bool bIsPlayerProp;

	UPROPERTY(Replicated, BlueprintReadOnly, Category = "Prop")
	AActor* OwningPlayer;

	UFUNCTION(BlueprintCallable, Category = "Prop")
	void SetupAsProp(int32 Index, FString Name, UStaticMesh* Mesh);

	UFUNCTION(BlueprintCallable, Category = "Prop")
	void AttachToPlayer(AActor* Player);

	UFUNCTION(BlueprintCallable, Category = "Prop")
	void DetachFromPlayer();

protected:
	virtual void BeginPlay() override;
};
