#include "PropHuntGameState.h"
#include "Net/UnrealNetwork.h"

APropHuntGameState::APropHuntGameState()
{
	CurrentPhase = EGamePhase::Lobby;
	PhaseTimeRemaining = 0.f;
	HunterScore = 0;
	PropScore = 0;
	RoundNumber = 0;
	AliveHunters = 0;
	AliveProps = 0;
	WinnerTeam = TEXT("");
}

void APropHuntGameState::GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const
{
	Super::GetLifetimeReplicatedProps(OutLifetimeProps);

	DOREPLIFETIME(APropHuntGameState, CurrentPhase);
	DOREPLIFETIME(APropHuntGameState, PhaseTimeRemaining);
	DOREPLIFETIME(APropHuntGameState, HunterScore);
	DOREPLIFETIME(APropHuntGameState, PropScore);
	DOREPLIFETIME(APropHuntGameState, RoundNumber);
	DOREPLIFETIME(APropHuntGameState, AliveHunters);
	DOREPLIFETIME(APropHuntGameState, AliveProps);
	DOREPLIFETIME(APropHuntGameState, WinnerTeam);
}

void APropHuntGameState::SetPhase(EGamePhase NewPhase)
{
	if (HasAuthority())
	{
		CurrentPhase = NewPhase;
	}
}

void APropHuntGameState::SetPhaseTime(float Time)
{
	if (HasAuthority())
	{
		PhaseTimeRemaining = Time;
	}
}

void APropHuntGameState::UpdateAliveCount(int32 Hunters, int32 Props)
{
	if (HasAuthority())
	{
		AliveHunters = Hunters;
		AliveProps = Props;
	}
}

void APropHuntGameState::AddScore(ETeam Team)
{
	if (HasAuthority())
	{
		if (Team == ETeam::Hunter)
		{
			HunterScore++;
		}
		else if (Team == ETeam::Prop)
		{
			PropScore++;
		}
	}
}

FString APropHuntGameState::GetPhaseString() const
{
	switch (CurrentPhase)
	{
	case EGamePhase::Lobby:
		return TEXT("Waiting in Lobby");
	case EGamePhase::Preparation:
		return TEXT("Preparing...");
	case EGamePhase::Hiding:
		return TEXT("Props Hide!");
	case EGamePhase::Hunting:
		return TEXT("Hunters Seek!");
	case EGamePhase::RoundEnd:
		return TEXT("Round Ended");
	default:
		return TEXT("Unknown");
	}
}

int32 APropHuntGameState::GetTotalPlayers() const
{
	return PlayerArray.Num();
}

int32 APropHuntGameState::GetTeamCount(ETeam Team) const
{
	int32 Count = 0;
	for (APlayerState* PS : PlayerArray)
	{
		if (APropHuntPlayerState* PHPS = Cast<APropHuntPlayerState>(PS))
		{
			if (PHPS->Team == Team)
			{
				Count++;
			}
		}
	}
	return Count;
}
