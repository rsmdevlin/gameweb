#pragma once

#include "CoreMinimal.h"
#include "GameFramework/GameModeBase.h"
#include "PropHuntGameState.h"
#include "PropHuntPlayerState.h"
#include "PropHuntGameMode.generated.h"

UCLASS()
class PROPHUNTGAME_API APropHuntGameMode : public AGameModeBase
{
	GENERATED_BODY()

public:
	APropHuntGameMode();

	virtual void BeginPlay() override;
	virtual void Tick(float DeltaTime) override;
	virtual void PostLogin(APlayerController* NewPlayer) override;
	virtual void Logout(AController* Exiting) override;

	// Game flow
	UFUNCTION(BlueprintCallable, Category = "Game")
	void StartRound();

	UFUNCTION(BlueprintCallable, Category = "Game")
	void EndRound(ETeam WinningTeam);

	UFUNCTION(BlueprintCallable, Category = "Game")
	void CheckWinConditions();

	UFUNCTION(BlueprintCallable, Category = "Game")
	void AssignTeams();

	UFUNCTION(BlueprintCallable, Category = "Game")
	void RespawnAllPlayers();

	UFUNCTION(BlueprintCallable, Category = "Game")
	int32 GetAlivePlayersInTeam(ETeam Team) const;

	// Phase management
	UFUNCTION(BlueprintCallable, Category = "Game")
	void SetPhase(EGamePhase NewPhase);

	UFUNCTION(BlueprintCallable, Category = "Game")
	void OnPhaseTimeExpired();

	// Player management
	UFUNCTION(BlueprintCallable, Category = "Game")
	void OnPlayerDied(AController* Killer, AController* Victim);

	// Configuration
	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Game Config")
	int32 MinPlayersToStart;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Game Config")
	float PreparationTime;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Game Config")
	float HidingTime;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Game Config")
	float HuntingTime;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Game Config")
	float RoundEndTime;

	UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Game Config")
	float HunterRatio;

protected:
	FTimerHandle PhaseTimerHandle;
	bool bRoundInProgress;

	void UpdatePhaseTimer();
	void TransitionToNextPhase();
	AActor* FindPlayerStart_Implementation(AController* Player, const FString& IncomingName = TEXT("")) override;
};
