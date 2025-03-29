import React, { useEffect, useRef } from 'react';
import {
	View,
	StyleSheet,
	ScrollView,
	Animated,
	Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '.';
import Colors from 'constants/Colors';
import GameCard from 'components/GameCard';

interface Category {
	id: string;
	name: string;
	icon: string;
	quizzesCount: number;
}

const width = Dimensions.get('window').width;

export default function QuizList() {
	const route = useRoute();

	const { categories } = route.params as { categories: Category[] };
	const navigation =
		useNavigation<NativeStackNavigationProp<RootStackParamList>>();
	const animations = useRef(
		categories.map(() => new Animated.Value(100))
	).current;

	useEffect(() => {
		const animationsArray = categories.map((_: unknown, index: number) =>
			Animated.timing(animations[index], {
				toValue: 0,
				duration: 500 + index * 100,
				useNativeDriver: true,
			})
		);
		Animated.stagger(100, animationsArray).start();
	}, []);

	return (
		<LinearGradient
			colors={[Colors.background3, Colors.background2]}
			style={styles.container}
		>
			<ScrollView
				showsVerticalScrollIndicator={false}
				style={{
					marginTop: 0,
				}}
			>
				<View style={styles.section}>
					{categories.map((game: Category, index: number) => (
						<Animated.View
							key={game.id}
							style={[
								{ transform: [{ translateY: animations[index] }] },
								{
									width: width - 20,
								},
							]}
						>
							<GameCard
								game={game}
								handleOnPress={() =>
									navigation.navigate('Quiz', { category: game.name })
								}
							/>
						</Animated.View>
					))}
				</View>
			</ScrollView>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	section: {
		marginBottom: 80,
		marginTop: 10,
		alignItems: 'center',
		justifyContent: 'center',
	},
});
