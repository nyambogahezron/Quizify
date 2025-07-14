import React, { useEffect, useRef, useState } from 'react';
import {
	View,
	StyleSheet,
	ScrollView,
	Animated,
	Dimensions,
	TextInput,
	Text,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Colors from 'constants/Colors';
import { RootStackParamList } from '@/interface';
import CategoryCard from '@/components/CategoryCard';

interface Category {
	id: string;
	name: string;
	icon: string;
	quizzesCount: number;
	totalPlayers: number;
}

const width = Dimensions.get('window').width;

export default function QuizList() {
	const route = useRoute();
	const [searchText, setSearchText] = useState('');

	const { categories } = route.params as { categories: Category[] };
	const navigation =
		useNavigation<NativeStackNavigationProp<RootStackParamList>>();

	const filteredCategories = categories.filter((category) =>
		category.name.toLowerCase().includes(searchText.toLowerCase())
	);

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
			<View style={styles.searchContainer}>
				<TextInput
					placeholder='Search quizzes...'
					placeholderTextColor={Colors.text + '80'}
					style={styles.searchInput}
					value={searchText}
					onChangeText={setSearchText}
				/>
			</View>
			<ScrollView
				showsVerticalScrollIndicator={false}
				style={{
					marginTop: 0,
				}}
			>
				<View style={styles.section}>
					{filteredCategories.length === 0 ? (
						<Text style={styles.noResults}>No quizzes found</Text>
					) : (
						filteredCategories.map((game: Category, index: number) => (
							<Animated.View
								key={index}
								style={[
									{ transform: [{ translateY: animations[index] }] },
									{
										width: width - 20,
									},
								]}
							>
								<CategoryCard
									game={game}
									index={index}
									handleOnPress={() =>
										navigation.navigate('Quiz', { category: game.name })
									}
								/>
							</Animated.View>
						))
					)}
				</View>
			</ScrollView>
		</LinearGradient>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	searchContainer: {
		padding: 16,
		paddingBottom: 8,
	},
	searchInput: {
		backgroundColor: Colors.background2,
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderRadius: 12,
		color: Colors.text,
		fontFamily: 'Rb-regular',
		fontSize: 16,
	},
	section: {
		marginBottom: 80,
		marginTop: 10,
		alignItems: 'center',
		justifyContent: 'center',
	},
	noResults: {
		color: Colors.text,
		fontFamily: 'Rb-medium',
		fontSize: 16,
		marginTop: 20,
	},
});
