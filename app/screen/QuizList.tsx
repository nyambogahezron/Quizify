import React, { useEffect, useRef } from 'react';
import {
	View,
	StyleSheet,
	ScrollView,
	Animated,
	Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { quizCategories } from '../lib/data';
import { RootStackParamList } from '.';
import Colors from 'constants/Colors';
import GameCard from 'components/GameCard';

const width = Dimensions.get('window').width;

export default function QuizList() {
	const navigation =
		useNavigation<NativeStackNavigationProp<RootStackParamList>>();
	const animations = useRef(
		quizCategories.map(() => new Animated.Value(100))
	).current;

	useEffect(() => {
		const animationsArray = quizCategories.map((_, index) =>
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
			colors={[Colors.background, Colors.background2]}
			style={styles.container}
		>
			<ScrollView
				showsVerticalScrollIndicator={false}
				style={{
					marginTop: 0,
				}}
			>
				<View style={styles.section}>
					{quizCategories.map((game, index) => (
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
