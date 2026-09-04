#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "PropActor.h"
#include "PropComponent.generated.h"

UCLASS(ClassGroup=(Custom), meta=(BlueprintSpawnableComponent))
class PROPHUNTGAME_API UPropComponent : public UActorComponent
{
	GENERATED_BODY()

public:
	UPropComponent();

	virtual void GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const override;
	virtual void TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction) override;

	// Available prop types
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Props")
	TArray<TSubclassOf<APropActor>> AvailablePropClasses;

	UPROPERTY(Replicated, BlueprintReadOnly, Category = "Props")
	APropActor* CurrentProp;

	UPROPERTY(Replicated, BlueprintReadOnly, Category = "Props")
	int32 CurrentPropIndex;

	UPROPERTY(Replicated, BlueprintReadOnly, Category = "Props")
	bool bIsTransformed;

	// Transform to prop
	UFUNCTION(BlueprintCallable, Category = "Props")
	void TransformToProp(int32 PropIndex);

	// Transform back to character
	UFUNCTION(BlueprintCallable, Category = "Props")
	void TransformToCharacter();

	// Server RPCs
	UFUNCTION(Server, Reliable, WithValidation)
	void ServerTransformToProp(int32 PropIndex);

	UFUNCTION(Server, Reliable, WithValidation)
	void ServerTransformToCharacter();

	// Multicast RPCs
	UFUNCTION(NetMulticast, Reliable)
	void MulticastSpawnProp(int32 PropIndex);

	UFUNCTION(NetMulticast, Reliable)
	void MulticastDestroyProp();

protected:
	virtual void BeginPlay() override;

	UPROPERTY()
	AActor* OwnerActor;

private:
	void SpawnPropActor(int32 PropIndex);
	void DestroyPropActor();
};
