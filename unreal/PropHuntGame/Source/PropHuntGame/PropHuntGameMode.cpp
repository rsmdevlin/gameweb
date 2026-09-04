#include "PropHuntGameMode.h"
#include "PropHuntCharacter.h"
#include "PropHuntGameState.h"
#include "PropHuntPlayerState.h"
#include "GameFramework/PlayerStart.h"
#include "Kismet/GameplayStatics.h"
#include "EngineUtils.h"

APropHuntGameMode::APropHuntGameMode()
{
	PrimaryActorTick.bCanEverTick = true;

	// Set default classes
	DefaultPawnClass = APropHuntCharacter::StaticClass();
	GameStateClass = APropHuntGameState::StaticClass();
	PlayerStateClass = APropHuntPlayerState::StaticClass();

	// Configuration
	MinPlayersToStart = 2;
	PreparationTime = 10.f;
	HidingTime = 30.f;
	HuntingTime = 300.f; // 5 minutes
	RoundEndTime = 10.f;
	HunterRatio = 0.25f; // 1 hunter per 4 players

	bRoundInProgress = false;
}

void APropHuntGameMode::BeginPlay()
{
	Super::BeginPlay();

	if (APropHuntGameState* GS = GetGameState<APropHuntGameState>())
	{
		GS->SetPhase(EGamePhase::Lobby);
	}
}

void APropHuntGameMode::Tick(float DeltaTime)
{
	Super::Tick(DeltaTime);

	if (bRoundInProgress)
	{
		UpdatePhaseTimer();
		CheckWinConditions();
	}
}

void APropHuntGameMode::PostLogin(APlayerController* NewPlayer)
{
	Super::PostLogin(NewPlayer);

	UE_LOG(LogTemp, Log, TEXT("Player joined: %s"), *NewPlayer->GetName());

	// Check if we can start
	if (GetGameState<APropHuntGameState>()->GetTotalPlayers() >= MinPlayersToStart)
	{
		if (!bRoundInProgress)
		{
			// Auto-start after a delay
			FTimerHandle StartDelayHandle;
			GetWorld()->GetTimerManager().SetTimer(StartDelayHandle, this, &APropHuntGameMode::StartRound, 3.f, false);
		}
	}
}

void APropHuntGameMode::Logout(AController* Exiting)
{
	Super::Logout(Exiting);

	UE_LOG(LogTemp, Log, TEXT("Player left: %s"), *Exiting->GetName());

	// Check if we need to end round
	if (bRoundInProgress)
	{
		CheckWinConditions();
	}
}

void APropHuntGameMode::StartRound()
{
	APropHuntGameState* GS = GetGameState<APropHuntGameState>();
	if (!GS) return;

	int32 PlayerCount = GS->GetTotalPlayers();
	if (PlayerCount < MinPlayersToStart)
	{
		UE_LOG(LogTemp, Warning, TEXT("Not enough players to start round"));
		return;
	}

	UE_LOG(LogTemp, Log, TEXT("Starting round %d"), GS->RoundNumber + 1);

	bRoundInProgress = true;
	GS->RoundNumber++;
	GS->WinnerTeam = TEXT("");

	// Assign teams
	AssignTeams();

	// Respawn all players
	RespawnAllPlayers();

	// Start preparation phase
	SetPhase(EGamePhase::Preparation);
}

void APropHuntGameMode::EndRound(ETeam WinningTeam)
{
	APropHuntGameState* GS = GetGameState<APropHuntGameState>();
	if (!GS) return;

	bRoundInProgress = false;

	UE_LOG(LogTemp, Log, TEXT("Round ended. Winner: %s"), WinningTeam == ETeam::Hunter ? TEXT("Hunters") : TEXT("Props"));

	GS->WinnerTeam = (WinningTeam == ETeam::Hunter) ? TEXT("HUNTERS WIN!") : TEXT("PROPS WIN!");
	GS->AddScore(WinningTeam);

	// Award wins to team players
	for (APlayerState* PS : GS->PlayerArray)
	{
		if (APropHuntPlayerState* PHPS = Cast<APropHuntPlayerState>(PS))
		{
			if (PHPS->Team == WinningTeam)
			{
				PHPS->AddRoundWin();
			}
		}
	}

	SetPhase(EGamePhase::RoundEnd);
}

void APropHuntGameMode::CheckWinConditions()
{
	APropHuntGameState* GS = GetGameState<APropHuntGameState>();
	if (!GS || !bRoundInProgress) return;

	if (GS->CurrentPhase != EGamePhase::Hunting) return;

	int32 AliveHunters = GetAlivePlayersInTeam(ETeam::Hunter);
	int32 AliveProps = GetAlivePlayersInTeam(ETeam::Prop);

	GS->UpdateAliveCount(AliveHunters, AliveProps);

	// Props win if all hunters are dead
	if (AliveHunters == 0 && AliveProps > 0)
	{
		EndRound(ETeam::Prop);
		return;
	}

	// Hunters win if all props are dead
	if (AliveProps == 0 && AliveHunters > 0)
	{
		EndRound(ETeam::Hunter);
		return;
	}
}

void APropHuntGameMode::AssignTeams()
{
	APropHuntGameState* GS = GetGameState<APropHuntGameState>();
	if (!GS) return;

	TArray<APropHuntPlayerState*> Players;
	for (APlayerState* PS : GS->PlayerArray)
	{
		if (APropHuntPlayerState* PHPS = Cast<APropHuntPlayerState>(PS))
		{
			Players.Add(PHPS);
		}
	}

	// Shuffle players
	for (int32 i = Players.Num() - 1; i > 0; i--)
	{
		int32 j = FMath::RandRange(0, i);
		Players.Swap(i, j);
	}

	// Calculate hunter count (at least 1, at most half)
	int32 TotalPlayers = Players.Num();
	int32 HunterCount = FMath::Max(1, FMath::FloorToInt(TotalPlayers * HunterRatio));
	HunterCount = FMath::Min(HunterCount, TotalPlayers / 2);

	UE_LOG(LogTemp, Log, TEXT("Assigning teams: %d Hunters, %d Props"), HunterCount, TotalPlayers - HunterCount);

	// Assign teams
	for (int32 i = 0; i < Players.Num(); i++)
	{
		if (i < HunterCount)
		{
			Players[i]->SetTeam(ETeam::Hunter);
		}
		else
		{
			Players[i]->SetTeam(ETeam::Prop);
		}
	}
}

void APropHuntGameMode::RespawnAllPlayers()
{
	for (FConstPlayerControllerIterator It = GetWorld()->GetPlayerControllerIterator(); It; ++It)
	{
		APlayerController* PC = It->Get();
		if (PC && PC->GetPawn())
		{
			APropHuntCharacter* Character = Cast<APropHuntCharacter>(PC->GetPawn());
			if (Character)
			{
				// Reset character state
				Character->Health = Character->MaxHealth;
				Character->SetCharacterState(ECharacterState::Normal);

				// Respawn at player start
				AActor* PlayerStart = FindPlayerStart(PC);
				if (PlayerStart)
				{
					Character->SetActorLocation(PlayerStart->GetActorLocation());
					Character->SetActorRotation(PlayerStart->GetActorRotation());
				}
			}
		}
	}
}

int32 APropHuntGameMode::GetAlivePlayersInTeam(ETeam Team) const
{
	int32 Count = 0;

	for (FConstPlayerControllerIterator It = GetWorld()->GetPlayerControllerIterator(); It; ++It)
	{
		APlayerController* PC = It->Get();
		if (PC)
		{
			APropHuntPlayerState* PS = PC->GetPlayerState<APropHuntPlayerState>();
			APropHuntCharacter* Character = Cast<APropHuntCharacter>(PC->GetPawn());

			if (PS && Character && PS->Team == Team && Character->IsAlive())
			{
				Count++;
			}
		}
	}

	return Count;
}

void APropHuntGameMode::SetPhase(EGamePhase NewPhase)
{
	APropHuntGameState* GS = GetGameState<APropHuntGameState>();
	if (!GS) return;

	GS->SetPhase(NewPhase);

	float PhaseTime = 0.f;

	switch (NewPhase)
	{
	case EGamePhase::Preparation:
		PhaseTime = PreparationTime;
		break;
	case EGamePhase::Hiding:
		PhaseTime = HidingTime;
		break;
	case EGamePhase::Hunting:
		PhaseTime = HuntingTime;
		break;
	case EGamePhase::RoundEnd:
		PhaseTime = RoundEndTime;
		break;
	default:
		break;
	}

	GS->SetPhaseTime(PhaseTime);

	UE_LOG(LogTemp, Log, TEXT("Phase changed to: %s (%.0f seconds)"), *GS->GetPhaseString(), PhaseTime);

	// Set timer for phase transition
	if (PhaseTime > 0.f)
	{
		GetWorld()->GetTimerManager().SetTimer(PhaseTimerHandle, this, &APropHuntGameMode::OnPhaseTimeExpired, PhaseTime, false);
	}
}

void APropHuntGameMode::OnPhaseTimeExpired()
{
	APropHuntGameState* GS = GetGameState<APropHuntGameState>();
	if (!GS) return;

	switch (GS->CurrentPhase)
	{
	case EGamePhase::Preparation:
		SetPhase(EGamePhase::Hiding);
		break;
	case EGamePhase::Hiding:
		SetPhase(EGamePhase::Hunting);
		break;
	case EGamePhase::Hunting:
		// Time ran out, props win
		EndRound(ETeam::Prop);
		break;
	case EGamePhase::RoundEnd:
		// Return to lobby or start new round
		StartRound();
		break;
	default:
		break;
	}
}

void APropHuntGameMode::UpdatePhaseTimer()
{
	APropHuntGameState* GS = GetGameState<APropHuntGameState>();
	if (!GS) return;

	if (GS->PhaseTimeRemaining > 0.f)
	{
		GS->PhaseTimeRemaining -= GetWorld()->GetDeltaSeconds();
		if (GS->PhaseTimeRemaining < 0.f)
		{
			GS->PhaseTimeRemaining = 0.f;
		}
	}
}

void APropHuntGameMode::OnPlayerDied(AController* Killer, AController* Victim)
{
	if (APropHuntPlayerState* VictimPS = Victim->GetPlayerState<APropHuntPlayerState>())
	{
		VictimPS->AddDeath();
	}

	if (Killer && Killer != Victim)
	{
		if (APropHuntPlayerState* KillerPS = Killer->GetPlayerState<APropHuntPlayerState>())
		{
			KillerPS->AddKill();
		}
	}

	CheckWinConditions();
}

AActor* APropHuntGameMode::FindPlayerStart_Implementation(AController* Player, const FString& IncomingName)
{
	// Find player starts based on team
	APropHuntPlayerState* PS = Player->GetPlayerState<APropHuntPlayerState>();
	ETeam PlayerTeam = PS ? PS->Team : ETeam::None;

	TArray<AActor*> PlayerStarts;
	UGameplayStatics::GetAllActorsOfClass(GetWorld(), APlayerStart::StaticClass(), PlayerStarts);

	if (PlayerStarts.Num() == 0)
	{
		return Super::FindPlayerStart_Implementation(Player, IncomingName);
	}

	// For now, return random player start
	// In full implementation, filter by team
	int32 RandomIndex = FMath::RandRange(0, PlayerStarts.Num() - 1);
	return PlayerStarts[RandomIndex];
}
