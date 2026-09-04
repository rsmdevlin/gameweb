#pragma once

#include "CoreMinimal.h"
#include "GameFramework/PlayerState.h"
#include "PropHuntPlayerState.generated.h"

UENUM(BlueprintType)
enum class ETeam : uint8
{
	None UMETA(DisplayName = "None"),
	Hunter UMETA(DisplayName = "Hunter"),
	Prop UMETA(DisplayName = "Prop")
};

UCLASS()
class PROPHUNTGAME_API APropHuntPlayerState : public APlayerState
{
	GENERATED_BODY()

public:
	APropHuntPlayerState();

	virtual void GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const override;

	UPROPERTY(Replicated, BlueprintReadOnly, Category = "Team")
	ETeam Team;

	UPROPERTY(Replicated, BlueprintReadOnly, Category = "Stats")
	int32 Kills;

	UPROPERTY(Replicated, BlueprintReadOnly, Category = "Stats")
	int32 Deaths;

	UPROPERTY(Replicated, BlueprintReadOnly, Category = "Stats")
	int32 RoundsWon;

	UPROPERTY(Replicated, BlueprintReadOnly, Category = "Stats")
	float SurvivalTime;

	UPROPERTY(Replicated, BlueprintReadOnly, Category = "Game")
	bool bIsReady;

	UFUNCTION(BlueprintCallable, Category = "Team")
	void SetTeam(ETeam NewTeam);

	UFUNCTION(BlueprintCallable, Category = "Stats")
	void AddKill();

	UFUNCTION(BlueprintCallable, Category = "Stats")
	void AddDeath();

	UFUNCTION(BlueprintCallable, Category = "Stats")
	void AddRoundWin();

	UFUNCTION(Server, Reliable, WithValidation)
	void ServerSetReady(bool bReady);
};
