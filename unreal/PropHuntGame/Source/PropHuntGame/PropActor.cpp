#include "PropActor.h"
#include "Components/StaticMeshComponent.h"
#include "Net/UnrealNetwork.h"

APropActor::APropActor()
{
	PrimaryActorTick.bCanEverTick = true;

	// Create mesh component
	PropMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("PropMesh"));
	RootComponent = PropMesh;

	PropMesh->SetCollisionEnabled(ECollisionEnabled::QueryAndPhysics);
	PropMesh->SetCollisionResponseToAllChannels(ECR_Block);
	PropMesh->SetSimulatePhysics(false);

	// Default values
	PropName = TEXT("Unknown Prop");
	PropIndex = 0;
	PropHealth = 100.f;
	PropMaxHealth = 100.f;
	PropMovementSpeed = 400.f;
	bIsPlayerProp = false;
	OwningPlayer = nullptr;

	// Enable replication
	bReplicates = true;
	SetReplicateMovement(true);
}

void APropActor::GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const
{
	Super::GetLifetimeReplicatedProps(OutLifetimeProps);

	DOREPLIFETIME(APropActor, bIsPlayerProp);
	DOREPLIFETIME(APropActor, OwningPlayer);
}

void APropActor::BeginPlay()
{
	Super::BeginPlay();
}

void APropActor::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);

	// If attached to player, follow player position
	if (bIsPlayerProp && OwningPlayer)
	{
		SetActorLocation(OwningPlayer->GetActorLocation());
		SetActorRotation(OwningPlayer->GetActorRotation());
	}
}

void APropActor::SetupAsProp(int32 Index, FString Name, UStaticMesh* Mesh)
{
	PropIndex = Index;
	PropName = Name;

	if (PropMesh && Mesh)
	{
		PropMesh->SetStaticMesh(Mesh);
	}
}

void APropActor::AttachToPlayer(AActor* Player)
{
	if (HasAuthority())
	{
		OwningPlayer = Player;
		bIsPlayerProp = true;

		// Disable collision when player-controlled
		PropMesh->SetCollisionEnabled(ECollisionEnabled::NoCollision);
	}
}

void APropActor::DetachFromPlayer()
{
	if (HasAuthority())
	{
		OwningPlayer = nullptr;
		bIsPlayerProp = false;

		// Re-enable collision
		PropMesh->SetCollisionEnabled(ECollisionEnabled::QueryAndPhysics);
	}
}
