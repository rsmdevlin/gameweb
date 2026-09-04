#include "PropHuntPlayerState.h"
#include "Net/UnrealNetwork.h"

APropHuntPlayerState::APropHuntPlayerState()
{
	Team = ETeam::None;
	Kills = 0;
	Deaths = 0;
	RoundsWon = 0;
	SurvivalTime = 0.f;
	bIsReady = false;
}

void APropHuntPlayerState::GetLifetimeReplicatedProps(TArray<FLifetimeProperty>& OutLifetimeProps) const
{
	Super::GetLifetimeReplicatedProps(OutLifetimeProps);

	DOREPLIFETIME(APropHuntPlayerState, Team);
	DOREPLIFETIME(APropHuntPlayerState, Kills);
	DOREPLIFETIME(APropHuntPlayerState, Deaths);
	DOREPLIFETIME(APropHuntPlayerState, RoundsWon);
	DOREPLIFETIME(APropHuntPlayerState, SurvivalTime);
	DOREPLIFETIME(APropHuntPlayerState, bIsReady);
}

void APropHuntPlayerState::SetTeam(ETeam NewTeam)
{
	Team = NewTeam;
}

void APropHuntPlayerState::AddKill()
{
	if (HasAuthority())
	{
		Kills++;
	}
}

void APropHuntPlayerState::AddDeath()
{
	if (HasAuthority())
	{
		Deaths++;
	}
}

void APropHuntPlayerState::AddRoundWin()
{
	if (HasAuthority())
	{
		RoundsWon++;
	}
}

void APropHuntPlayerState::ServerSetReady_Implementation(bool bReady)
{
	bIsReady = bReady;
}

bool APropHuntPlayerState::ServerSetReady_Validate(bool bReady)
{
	return true;
}
