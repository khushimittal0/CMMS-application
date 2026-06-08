import React from 'react';
import { View } from 'react-native';

interface CustomIconProps {
  name: 'lock' | 'profile' | 'home' | 'tasks' | 'plus' | 'logout' | 'chevron-right' | 'check' | 'settings' | 'menu' | 'maintenance' | 'repair' | 'inspection';
  size?: number;
  color?: string;
}

export function CustomIcon({ name, size = 24, color = '#333333' }: CustomIconProps) {
  const containerStyle = {
    width: size,
    height: size,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  };

  switch (name) {
    case 'lock': {
      const shackleSize = size * 0.5;
      const bodyHeight = size * 0.45;
      const bodyWidth = size * 0.7;
      const lockContainerStyle = [containerStyle, { justifyContent: 'flex-end' as const }];
      const shackleStyle = {
        width: shackleSize,
        height: shackleSize,
        borderWidth: Math.max(1.5, size * 0.08),
        borderColor: color,
        borderBottomWidth: 0,
        borderTopLeftRadius: shackleSize / 2,
        borderTopRightRadius: shackleSize / 2,
        marginBottom: -2,
      };
      const lockBodyStyle = {
        width: bodyWidth,
        height: bodyHeight,
        backgroundColor: color,
        borderRadius: Math.max(2, size * 0.08),
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
      };
      const lockDotStyle = {
        width: size * 0.12,
        height: size * 0.12,
        borderRadius: size * 0.06,
        backgroundColor: '#FFF',
      };
      const lockRectStyle = {
        width: size * 0.06,
        height: size * 0.12,
        backgroundColor: '#FFF',
        marginTop: -1,
      };

      return (
        <View style={lockContainerStyle}>
          <View style={shackleStyle} />
          <View style={lockBodyStyle}>
            <View style={lockDotStyle} />
            <View style={lockRectStyle} />
          </View>
        </View>
      );
    }

    case 'profile': {
      const headSize = size * 0.4;
      const bodyWidth = size * 0.8;
      const bodyHeight = size * 0.35;
      const profileContainerStyle = [containerStyle, { justifyContent: 'center' as const }];
      const profileHeadStyle = {
        width: headSize,
        height: headSize,
        borderRadius: headSize / 2,
        borderWidth: Math.max(1.5, size * 0.08),
        borderColor: color,
        marginBottom: 2,
      };
      const profileBodyStyle = {
        width: bodyWidth,
        height: bodyHeight,
        borderWidth: Math.max(1.5, size * 0.08),
        borderColor: color,
        borderBottomWidth: 0,
        borderTopLeftRadius: bodyWidth / 2,
        borderTopRightRadius: bodyWidth / 2,
      };

      return (
        <View style={profileContainerStyle}>
          <View style={profileHeadStyle} />
          <View style={profileBodyStyle} />
        </View>
      );
    }

    case 'home': {
      const roofWidth = size * 0.8;
      const roofHeight = size * 0.4;
      const baseWidth = size * 0.65;
      const baseHeight = size * 0.45;
      const homeContainerStyle = [containerStyle, { justifyContent: 'center' as const }];
      const roofStyle = {
        width: 0,
        height: 0,
        borderStyle: 'solid' as const,
        borderLeftWidth: roofWidth / 2,
        borderRightWidth: roofWidth / 2,
        borderBottomWidth: roofHeight,
        borderLeftColor: 'transparent' as const,
        borderRightColor: 'transparent' as const,
        borderBottomColor: color,
      };
      const houseBaseStyle = {
        width: baseWidth,
        height: baseHeight,
        borderWidth: Math.max(1.5, size * 0.08),
        borderColor: color,
        borderTopWidth: 0,
        alignItems: 'center' as const,
        justifyContent: 'flex-end' as const,
      };
      const doorStyle = {
        width: baseWidth * 0.3,
        height: baseHeight * 0.6,
        backgroundColor: color,
        borderTopLeftRadius: 2,
        borderTopRightRadius: 2,
      };

      return (
        <View style={homeContainerStyle}>
          <View style={roofStyle} />
          <View style={houseBaseStyle}>
            <View style={doorStyle} />
          </View>
        </View>
      );
    }

    case 'tasks': {
      const padWidth = size * 0.75;
      const padHeight = size * 0.85;
      const tasksContainerStyle = {
        width: padWidth,
        height: padHeight,
        borderWidth: Math.max(1.5, size * 0.08),
        borderColor: color,
        borderRadius: 2,
        padding: size * 0.08,
        justifyContent: 'space-around' as const,
      };
      const taskRowStyle = {
        flexDirection: 'row' as const,
        alignItems: 'center' as const,
      };
      const taskBulletStyle = {
        width: size * 0.1,
        height: size * 0.1,
        backgroundColor: color,
        marginRight: 4,
      };
      const taskLineStyle = {
        flex: 1,
        height: Math.max(1, size * 0.06),
        backgroundColor: color,
      };

      return (
        <View style={containerStyle}>
          <View style={tasksContainerStyle}>
            <View style={taskRowStyle}>
              <View style={taskBulletStyle} />
              <View style={taskLineStyle} />
            </View>
            <View style={taskRowStyle}>
              <View style={taskBulletStyle} />
              <View style={taskLineStyle} />
            </View>
            <View style={taskRowStyle}>
              <View style={taskBulletStyle} />
              <View style={taskLineStyle} />
            </View>
          </View>
        </View>
      );
    }

    case 'plus': {
      const thick = Math.max(2, size * 0.08);
      const plusHorizontalStyle = {
        position: 'absolute' as const,
        width: size * 0.7,
        height: thick,
        backgroundColor: color,
        borderRadius: thick / 2,
      };
      const plusVerticalStyle = {
        position: 'absolute' as const,
        width: thick,
        height: size * 0.7,
        backgroundColor: color,
        borderRadius: thick / 2,
      };

      return (
        <View style={containerStyle}>
          <View style={plusHorizontalStyle} />
          <View style={plusVerticalStyle} />
        </View>
      );
    }

    case 'logout': {
      const thick = Math.max(1.5, size * 0.08);
      const logoutBracketStyle = {
        position: 'absolute' as const,
        left: 2,
        top: 2,
        bottom: 2,
        width: size * 0.5,
        borderWidth: thick,
        borderColor: color,
        borderRightWidth: 0,
        borderTopLeftRadius: 3,
        borderBottomLeftRadius: 3,
      };
      const logoutArrowStyle = {
        position: 'absolute' as const,
        right: 2,
        left: size * 0.35,
        height: thick,
        backgroundColor: color,
        alignSelf: 'center' as const,
        justifyContent: 'center' as const,
        alignItems: 'flex-end' as const,
      };
      const logoutArrowHeadStyle = {
        width: size * 0.25,
        height: size * 0.25,
        borderTopWidth: thick,
        borderRightWidth: thick,
        borderColor: color,
        transform: [{ rotate: '45deg' }] as const,
        marginTop: -size * 0.11,
        marginRight: -1,
      };

      return (
        <View style={containerStyle}>
          <View style={logoutBracketStyle} />
          <View style={logoutArrowStyle}>
            <View style={logoutArrowHeadStyle} />
          </View>
        </View>
      );
    }

    case 'chevron-right': {
      const thick = Math.max(2, size * 0.08);
      const chevronContainerStyle = [containerStyle, { transform: [{ rotate: '45deg' }] as const }];
      const chevronIconStyle = {
        width: size * 0.35,
        height: size * 0.35,
        borderTopWidth: thick,
        borderRightWidth: thick,
        borderColor: color,
      };

      return (
        <View style={chevronContainerStyle}>
          <View style={chevronIconStyle} />
        </View>
      );
    }

    case 'check': {
      const thick = Math.max(2.5, size * 0.08);
      const checkStyle = {
        width: size * 0.6,
        height: size * 0.35,
        borderLeftWidth: thick,
        borderBottomWidth: thick,
        borderColor: color,
        transform: [{ rotate: '-45deg' }] as const,
        marginTop: -size * 0.1,
      };

      return (
        <View style={containerStyle}>
          <View style={checkStyle} />
        </View>
      );
    }

    case 'settings': {
      const radius = size * 0.35;
      const center = size * 0.15;
      const settingsContainerStyle = [containerStyle, { justifyContent: 'center' as const, alignItems: 'center' as const }];
      const settingsOuterStyle = {
        width: radius * 2,
        height: radius * 2,
        borderRadius: radius,
        borderWidth: Math.max(2, size * 0.08),
        borderColor: color,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
      };
      const settingsCenterStyle = {
        width: center * 2,
        height: center * 2,
        borderRadius: center,
        backgroundColor: color,
      };
      const settingsNodeBase = {
        position: 'absolute' as const,
        width: 4,
        height: 4,
        backgroundColor: color,
      };
      const topNodeStyle = { ...settingsNodeBase, top: 1, height: 3 };
      const bottomNodeStyle = { ...settingsNodeBase, bottom: 1, height: 3 };
      const leftNodeStyle = { ...settingsNodeBase, left: 1, width: 3 };
      const rightNodeStyle = { ...settingsNodeBase, right: 1, width: 3 };

      return (
        <View style={settingsContainerStyle}>
          <View style={settingsOuterStyle}>
            <View style={settingsCenterStyle} />
          </View>
          <View style={topNodeStyle} />
          <View style={bottomNodeStyle} />
          <View style={leftNodeStyle} />
          <View style={rightNodeStyle} />
        </View>
      );
    }

    case 'menu': {
      const thick = Math.max(2, size * 0.08);
      const menuContainerStyle = [containerStyle, { justifyContent: 'space-around' as const, paddingVertical: size * 0.15 }];
      const menuLineStyle = {
        width: size * 0.8,
        height: thick,
        backgroundColor: color,
        borderRadius: thick / 2,
      };

      return (
        <View style={menuContainerStyle}>
          <View style={menuLineStyle} />
          <View style={menuLineStyle} />
          <View style={menuLineStyle} />
        </View>
      );
    }

    case 'maintenance': {
      const wrenchBodyStyle = {
        width: size * 0.25,
        height: size * 0.7,
        backgroundColor: color,
        transform: [{ rotate: '-45deg' }] as const,
        borderRadius: 2,
        alignItems: 'center' as const,
        justifyContent: 'space-between' as const,
      };
      const wrenchHeadBorderStyle = {
        borderWidth: 2,
        borderColor: '#FFF',
      };
      const topWrenchHeadStyle = {
        width: size * 0.45,
        height: size * 0.3,
        borderRadius: size * 0.15,
        backgroundColor: color,
        marginTop: -size * 0.05,
        ...wrenchHeadBorderStyle,
      };
      const bottomWrenchHeadStyle = {
        width: size * 0.45,
        height: size * 0.3,
        borderRadius: size * 0.15,
        backgroundColor: color,
        marginBottom: -size * 0.05,
        ...wrenchHeadBorderStyle,
      };

      return (
        <View style={containerStyle}>
          <View style={wrenchBodyStyle}>
            <View style={topWrenchHeadStyle} />
            <View style={bottomWrenchHeadStyle} />
          </View>
        </View>
      );
    }

    case 'repair': {
      const repairHandleStyle = {
        width: size * 0.16,
        height: size * 0.75,
        backgroundColor: color,
        borderRadius: 2,
      };
      const repairHeadStyle = {
        width: size * 0.65,
        height: size * 0.25,
        backgroundColor: color,
        position: 'absolute' as const,
        top: size * 0.1,
        borderRadius: 2,
      };

      return (
        <View style={containerStyle}>
          <View style={repairHandleStyle} />
          <View style={repairHeadStyle} />
        </View>
      );
    }

    case 'inspection': {
      const clipboardStyle = {
        width: size * 0.65,
        height: size * 0.8,
        borderWidth: 1.5,
        borderColor: color,
        borderRadius: 2,
        padding: 2,
      };
      const clipStyle = {
        width: '50%' as const,
        height: 4,
        backgroundColor: color,
        alignSelf: 'center' as const,
        marginTop: -4,
      };
      const checkmarkContainerStyle = {
        flex: 1,
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
      };
      const checkmarkStyle = {
        width: size * 0.3,
        height: size * 0.18,
        borderLeftWidth: 1.5,
        borderBottomWidth: 1.5,
        borderColor: color,
        transform: [{ rotate: '-45deg' }] as const,
        marginTop: -2,
      };

      return (
        <View style={containerStyle}>
          <View style={clipboardStyle}>
            <View style={clipStyle} />
            <View style={checkmarkContainerStyle}>
              <View style={checkmarkStyle} />
            </View>
          </View>
        </View>
      );
    }
  }
}
