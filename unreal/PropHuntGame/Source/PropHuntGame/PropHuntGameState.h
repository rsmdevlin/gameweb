#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameStateBase.h"
#include "PropHuntPlayerState.h"
#include "PropHuntGameState.generated.h"

UENUM(BlueprintType)
enum class EGamePhase : uint8
{
	Lobby UMETA(DisplayName = "Lobby"),
	Preparation UMETA(DisplayName = "Preparation"),
	Hiding UMETA(DisplayName = "Hiding"),
	Hunting UMETA(DisplayName = "Hunting"),
	RoundEnd UMETA(DisplayName = "Round End")
};

UCLASS()
class PROPHUNTGAME_API APropHuntGameState : public AGameStateBase
{
	GENERATED_BODY()

public:
	APropHuntGameState();

	virtual void GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const override;

	UPROPERTY(Replicated, BlueprintReadOnly, Category = "Game")
	EGamePhase CurrentPhase;

	UPROPERTY(Replicated, BlueprintReadOnly, Category = "Game")
	float PhaseTimeRemaining;

	UPROPERTY(Replicated, BlueprintReadOnly, Category = "Game")
	int32 HunterScore;

	UPROPERTY(Replicated, BlueprintReadOnly, Category = "Game")
	int32 PropScore;

	UPROPERTY(Replicated, BlueprintReadOnly, Category = "Game")
	int32 RoundNumber;

	UPROPERTY(Replicated, BlueprintReadOnly, Category = "Game")
	int32 AliveHunters;

	UPROPERTY(Replicated, BlueprintReadOnly, Category = "Game")
	int32 AliveProps;

	UPROPERTY(Replicated, BlueprintReadOnly, Category = "Game")
	FString WinnerTeam;

	UFUNCTION(BlueprintCallable, Category = "Game")
	void SetPhase(EGamePhase NewPhase);

	UFUNCTION(BlueprintCallable, Category = "Game")
	void SetPhaseTime(float Time);

	UFUNCTION(BlueprintCallable, Category = "Game")
	void UpdateAliveCount(int32 Hunters, int32 Props);

	UFUNCTION(BlueprintCallable, Category = "Game")
	void AddScore(ETeam Team);

	UFUNCTION(BlueprintCallable, Category = "Game")
	FString GetPhaseString() const;

	UFUNCTION(BlueprintCallable, Category = "Game")
	int32 GetTotalPlayers() const;

	UFUNCTION(BlueprintCallable, Category = "Game")
	int32 GetTeamCount(ETeam Team) const;
};
