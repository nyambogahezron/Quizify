import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import GameCard from '@/components/GameCard';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '..';
import { SafeAreaView } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import { moreGamesList } from '@/lib/data';

export default function Gamelist() {
	const navigation =
		useNavigation<NativeStackNavigationProp<RootStackParamList>>();
	return (
		<SafeAreaView style={{ flex: 1 }}>
			<LinearGradient
				colors={[Colors.background3, Colors.background2]}
				style={{ flex: 1 }}
			>
				<ScrollView
					style={styles.container}
					showsVerticalScrollIndicator={false}
					showsHorizontalScrollIndicator={false}
				>
					{moreGamesList.map((game: any) => (
						<GameCard
							key={game.id}
							game={game}
							handleOnPress={() => navigation.navigate(game.path)}
						/>
					))}
				</ScrollView>
			</LinearGradient>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 10,
		marginTop: 10,
	},
});
