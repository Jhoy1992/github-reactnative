import React, {Component} from 'react';
import {TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
  Loading,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({navigation}) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    loading: false,
    page: 1,
    refreshing: false,
    noMoreStars: false,
  };

  async componentDidMount() {
    this.setState({loading: true});
    await this.loadStars();
    this.setState({loading: false});
  }

  loadStars = async () => {
    const {navigation} = this.props;
    const {stars, page} = this.state;

    const user = navigation.getParam('user');

    const response = await api.get(`/users/${user.login}/starred?page=${page}`);

    if (!response.data.length) {
      this.setState({noMoreStars: true});
    }

    this.setState({
      stars: [...stars, ...response.data],
      page: page + 1,
    });
  };

  refreshStars = async () => {
    await this.setState({stars: [], refreshing: true, page: 1});

    await this.loadStars();

    this.setState({refreshing: false});
  };

  handleNavigate = repository => {
    const {navigation} = this.props;
    navigation.navigate('Repository', {repository});
  };

  render() {
    const {navigation} = this.props;
    const {stars, loading, refreshing, noMoreStars} = this.state;
    const user = navigation.getParam('user');

    return (
      <Container>
        <Header>
          <Avatar source={{uri: user.avatar}} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>

        {loading ? (
          <Loading />
        ) : (
          <Stars
            data={stars}
            onEndReachedThreshold={0.2}
            onEndReached={this.loadStars}
            onRefresh={this.refreshStars}
            refreshing={refreshing}
            ListFooterComponent={!noMoreStars && !refreshing && <Loading />}
            keyExtractor={star => String(star.id)}
            renderItem={({item}) => (
              <TouchableOpacity onPress={() => this.handleNavigate(item)}>
                <Starred>
                  <OwnerAvatar source={{uri: item.owner.avatar_url}} />
                  <Info>
                    <Title>{item.name}</Title>
                    <Author>{item.owner.login}</Author>
                  </Info>
                </Starred>
              </TouchableOpacity>
            )}
          />
        )}
      </Container>
    );
  }
}
