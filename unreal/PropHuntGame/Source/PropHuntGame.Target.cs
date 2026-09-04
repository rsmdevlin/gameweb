using UnrealBuildTool;
using System.Collections.Generic;

public class PropHuntGameTarget : TargetRules
{
	public PropHuntGameTarget(TargetInfo Target) : base(Target)
	{
		Type = TargetType.Game;
		DefaultBuildSettings = BuildSettingsVersion.V4;
		IncludeOrderVersion = EngineIncludeOrderVersion.Unreal5_3;
		ExtraModuleNames.Add("PropHuntGame");
	}
}
