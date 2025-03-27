import React from 'react';
import { TextInput, StyleSheet, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

interface CustomTextInputProps {
	placeholder: string;
	value: string;
	onChangeText: (text: string) => void;
	icon?: keyof typeof Ionicons.glyphMap;
}

export function CustomTextInput({
	placeholder,
	value,
	onChangeText,
	icon,
}: CustomTextInputProps) {
	const [isFocused, setIsFocused] = React.useState(false);
	return (
		<View style={styles.inputContainer}>
			{icon && (
				<Ionicons
					name={icon}
					size={20}
					color={Colors.iconColor}
					style={styles.inputIcon}
				/>
			)}
			<TextInput
				onFocus={() => setIsFocused(true)}
				onBlur={() => setIsFocused(false)}
				style={[styles.input, isFocused && styles.focused]}
				placeholder={placeholder}
				value={value}
				onChangeText={onChangeText}
			/>
		</View>
	);
}

interface CustomPasswordInputProps extends CustomTextInputProps {
	password: string;
	setPassword: (password: string) => void;
}

export function CustomPasswordInput({
	placeholder,
	value,
	onChangeText,
	password,
	setPassword,
}: CustomPasswordInputProps) {
	const [showPassword, setShowPassword] = React.useState(false);
	const [isFocused, setIsFocused] = React.useState(false);

	return (
		<View style={styles.inputContainer}>
			<Ionicons
				name='lock-closed-outline'
				size={20}
				color={Colors.iconColor}
				style={styles.inputIcon}
			/>
			<TextInput
				onFocus={() => setIsFocused(true)}
				onBlur={() => setIsFocused(false)}
				style={[styles.input, isFocused && styles.focused]}
				placeholder={placeholder}
				value={password}
				onChangeText={setPassword}
				secureTextEntry={!showPassword}
			/>
			<TouchableOpacity
				onPress={() => setShowPassword(!showPassword)}
				style={styles.passwordToggle}
			>
				<Ionicons
					name={showPassword ? 'eye-off-outline' : 'eye-outline'}
					size={20}
					color={Colors.iconColor}
				/>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	inputIcon: {
		marginRight: 12,
	},
	input: {
		flex: 1,
		fontFamily: 'Nunito-Regular',
		fontSize: 16,
		color: '#333333',
	},
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 2,
		borderColor: Colors.borderColor,
		borderRadius: 12,
		paddingHorizontal: 16,
		marginBottom: 16,
		height: 56,
		backgroundColor: 'rgba(255, 255, 255, 0.9)',
	},
	focused: {
		borderColor: Colors.primary,
	},
	passwordToggle: {
		padding: 8,
	},
});
