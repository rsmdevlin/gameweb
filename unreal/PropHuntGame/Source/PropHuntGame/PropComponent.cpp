#include "PropComponent.h"
#include "Net/UnrealNetwork.h"
#include "Engine/World.h"

UPropComponent::UPropComponent()
{
	PrimaryComponentTick.bCanEverTick = true;
	SetIsReplicatedByDefault(true);

	CurrentProp = nullptr;
	CurrentPropIndex = -1;
	bIsTransformed = false;
}

void UPropComponent::GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const
{
	Super::GetLifetimeReplicatedProps(OutLifetimeProps);

	DOREPLIFETIME(UPropComponent, CurrentProp);
	DOREPLIFETIME(UPropComponent, CurrentPropIndex);
	DOREPLIFETIME(UPropComponent, bIsTransformed);
}

void UPropComponent::BeginPlay()
{
	Super::BeginPlay();

	OwnerActor = GetOwner();
}

void UPropComponent::TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction)
{
	Super::TickComponent(DeltaTime, TickType, ThisTickFunction);

	// Sync prop position with owner
	if (bIsTransformed && CurrentProp && OwnerActor)
	{
		CurrentProp->SetActorLocation(OwnerActor->GetActorLocation());
		CurrentProp->SetActorRotation(OwnerActor->GetActorRotation());
	}
}

void UPropComponent::TransformToProp(int32 PropIndex)
{
	if (!OwnerActor || PropIndex < 0 || PropIndex >= AvailablePropClasses.Num())
	{
		return;
	}

	ServerTransformToProp(PropIndex);
}

void UPropComponent::TransformToCharacter()
{
	ServerTransformToCharacter();
}

void UPropComponent::ServerTransformToProp_Implementation(int32 PropIndex)
{
	if (bIsTransformed)
	{
		// Destroy existing prop
		DestroyPropActor();
	}

	MulticastSpawnProp(PropIndex);
}

bool UPropComponent::ServerTransformToProp_Validate(int32 PropIndex)
{
	return PropIndex >= 0 && PropIndex < AvailablePropClasses.Num();
}

void UPropComponent::ServerTransformToCharacter_Implementation()
{
	if (!bIsTransformed)
	{
		return;
	}

	MulticastDestroyProp();
}

bool UPropComponent::ServerTransformToCharacter_Validate()
{
	return true;
}

void UPropComponent::MulticastSpawnProp_Implementation(int32 PropIndex)
{
	SpawnPropActor(PropIndex);
}

void UPropComponent::MulticastDestroyProp_Implementation()
{
	DestroyPropActor();
}

void UPropComponent::SpawnPropActor(int32 PropIndex)
{
	if (!OwnerActor || PropIndex < 0 || PropIndex >= AvailablePropClasses.Num())
	{
		return;
	}

	UWorld* World = GetWorld();
	if (!World)
	{
		return;
	}

	// Destroy existing prop
	if (CurrentProp)
	{
		CurrentProp->Destroy();
		CurrentProp = nullptr;
	}

	// Spawn new prop
	FActorSpawnParameters SpawnParams;
	SpawnParams.Owner = OwnerActor;
	SpawnParams.Instigator = Cast<APawn>(OwnerActor);
	SpawnParams.SpawnCollisionHandlingOverride = ESpawnActorCollisionHandlingMethod::AlwaysSpawn;

	FVector SpawnLocation = OwnerActor->GetActorLocation();
	FRotator SpawnRotation = OwnerActor->GetActorRotation();

	CurrentProp = World->SpawnActor<APropActor>(AvailablePropClasses[PropIndex], SpawnLocation, SpawnRotation, SpawnParams);

	if (CurrentProp)
	{
		CurrentProp->AttachToPlayer(OwnerActor);
		CurrentPropIndex = PropIndex;
		bIsTransformed = true;

		UE_LOG(LogTemp, Log, TEXT("Spawned prop %d for %s"), PropIndex, *OwnerActor->GetName());
	}
}

void UPropComponent::DestroyPropActor()
{
	if (CurrentProp)
	{
		CurrentProp->Destroy();
		CurrentProp = nullptr;
	}

	CurrentPropIndex = -1;
	bIsTransformed = false;
}
